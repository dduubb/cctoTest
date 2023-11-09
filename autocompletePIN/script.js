// v.12
import { TableauEventType } from 'https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.js';

document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
});

function initAutocomplete() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    // Debounced function
    const debouncedFetchData = debounce(function(e) {
        // Check if last input was a space or minus before proceeding
        //if (e.inputType !== 'insertText' || (e.data !== ' ' && e.data !== '~')) { // replace - with ~ 
        //    return; // If the last input is not a space or dash, do nothing.
        //}

        const inputValue = formatInput(e.target.value);

        if (inputValue.length < 3) {
            resultsContainer.innerHTML = '';
            return;
        }

        document.querySelector("#loading-spinner").style.display = 'block';

        fetch(`https://autocomplete-server-arp6.onrender.com/search-endpoint?query=${inputValue}`)
            .then(response => response.json())
            .then(data => {
                let resultsHTML = '';
                document.querySelector("#loading-spinner").style.display = 'none'; // Hide spinner when data arrives




                data.forEach(item => {
                    const highlightedTaxpayerName = highlightMatch(item.TaxpayerName, inputValue);
                    const highlightedPIN = highlightMatch(formatPIN(item.PIN), formatPIN(inputValue));
                    const highlightedAddress = highlightMatch(item.Address, inputValue);

                    resultsHTML += `
                        <div class="result-item" 
                             data-pin="${item.PIN}" 
                             data-classification="${item.query}" 
                             //data-classification="${item.Classification}" 
                             //data-taxcode21="${item.TaxCode21}"
                             //data-taxcode22="${item.TaxCode22}"
                             //data-billed21="${item.Billed21}"
                             //data-billed22="${item.Billed22}" 
                             > 
                            ${highlightedTaxpayerName} | ${(highlightedPIN)} | ${highlightedAddress}
                        </div>
                    `;
                });

                resultsContainer.innerHTML = resultsHTML;

                

                const resultItems = document.querySelectorAll(".result-item");
                resultItems.forEach(item => {
                    item.addEventListener("click", async function() {
                        const selectedData = {
                            PIN: this.getAttribute("data-pin"),
                            //query: this.getAttribute("query")  //,
                            TaxCode21: this.getAttribute("data-taxcode21"),
                            TaxCode22: this.getAttribute("data-taxcode22"),
                            Billed21: this.getAttribute("data-billed21"),
                            Billed22: this.getAttribute("data-billed22")
                        };
                document.querySelector("#clear-button").style.display = 'block'; // show clear with a result
                
                document.querySelector('#clear-button').addEventListener('click', function() {
                    // Clear the input field
                    const input = document.querySelector("#autocomplete-input");
                    input.value = '';
                
                    // Clear the Tableau parameter
                    updateTableauParameter('query', 'empty');
                  });        
     const selectedText = `${this.innerText.split(' - ')[0]}`;
    input.value = selectedText;
 
    // Clear the dropdown
    resultsContainer.innerHTML = '';
    //let selectParam = `${selectedData.query}`;
    let selectParam = `${selectedData.TaxCode21};${selectedData.TaxCode22};${selectedData.Billed21};${selectedData.Billed22}`
    console.log(selectParam);
    await updateTableauParameter('query', selectParam);
                        
                    });
                });

            })
            .catch(error => {
                console.error("Error fetching data:", error);
                resultsContainer.innerHTML = 'Error fetching results';
                document.querySelector("#loading-spinner").style.display = 'none';

            });

    }, 400);  // 300ms debounce time

    input.addEventListener("input", debouncedFetchData);
}

function formatInput(value) {
    return value.replaceAll('-','').trim().replace(/\s+/g, ' ').toLowerCase();
}

function formatPIN(pin) {
    return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
}

function highlightMatch(text, term) {
    const startIndex = text.toLowerCase().indexOf(term.toLowerCase());
    if (startIndex >= 0) {
      const endLength = term.length;
      const matchingText = text.substr(startIndex, endLength);
      return text.substring(0, startIndex) + '<strong>' + matchingText + '</strong>' + text.substring(startIndex + endLength);
    }
    return text; // No match found; return original text
  }

function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

async function updateTableauParameter(paramName, paramValue) {
    console.log(`updatePram will run with ${paramName} and ${paramValue}`);
    // Get the viz object from the HTML web component
    const viz = document.querySelector('tableau-viz');
    paramValue = paramValue ?? '10021;10021;8888.88;7777.77' //fallback
    // Update the parameter
    try {
        const updatedParam = await viz.workbook.changeParameterValueAsync(paramName, paramValue);
        console.log(`Updated parameter: ${updatedParam.name}, ${updatedParam.currentValue.value}`);
    } catch (e) {
        console.error(e.toString());
    }
}

    // Check the user's device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
    // Modify the "device" parameter based on the device type
    const tableauViz = document.querySelector('tableau-viz');
    if (isMobile) {
        console.log("mobile")
      tableauViz.setAttribute('device', 'phone');
    } else {
        console.log("desktop")
      tableauViz.setAttribute('device', 'desktop');
    }