// v.12
document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
});

function initAutocomplete() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    // Debounced function
    const debouncedFetchData = debounce(function(e) {
        // Check if last input was a space or minus before proceeding
        if (e.inputType !== 'insertText' || (e.data !== ' ' && e.data !== '~')) { // replace - with ~ 
            return; // If the last input is not a space or dash, do nothing.
        }

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
                    resultsHTML += `
                        <div class="result-item" 
                             data-pin="${item.PIN}" 
                             data-classification="${item.Classification}" 
                             data-taxcode21="${item.TaxCode21}"
                             data-taxcode22="${item.TaxCode22}"
                             data-billed21="${item.Billed21}"
                             data-billed22="${item.Billed22}">
                            ${item.TaxpayerName} | ${formatPIN(item.PIN)} | ${item.Address}
                        </div>
                    `;
                });

                resultsContainer.innerHTML = resultsHTML;

                const resultItems = document.querySelectorAll(".result-item");
                resultItems.forEach(item => {
                    item.addEventListener("click", async function() {
                        const selectedData = {
                            PIN: this.getAttribute("data-pin"),
                            Classification: this.getAttribute("data-classification"),
                            TaxCode21: this.getAttribute("data-taxcode21"),
                            TaxCode22: this.getAttribute("data-taxcode22"),
                            Billed21: this.getAttribute("data-billed21"),
                            Billed22: this.getAttribute("data-billed22")
                        };
 await updateTableauParameter('setValue22', selectedData.billed22);
                        
                        console.log(selectedData.billed22);
    const selectedText = `${this.innerText.split(' - ')[0]}`;
    input.value = selectedText;

    // Clear the dropdown
    resultsContainer.innerHTML = '';
                        
                    });
                });

            })
            .catch(error => {
                console.error("Error fetching data:", error);
                resultsContainer.innerHTML = 'Error fetching results';
                document.querySelector("#loading-spinner").style.display = 'none';

            });

    }, 300);  // 300ms debounce time

    input.addEventListener("input", debouncedFetchData);
}

function formatInput(value) {
    return value.replaceAll('-','').trim().replace(/\s+/g, ' ').toLowerCase();
}

function formatPIN(pin) {
    return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
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
    // Get the viz object from the HTML web component
    const viz = document.querySelector('tableau-viz');

    // Wait for the viz to become interactive
    await new Promise((resolve, reject) => {
        // Add an event listener to verify the viz becomes interactive
        viz.addEventListener(TableauEventType.FirstInteractive, () => {
            console.log('Viz is interactive!');
            resolve();
        });
    });

    // Make the Overview dashboard the active sheet
    const dashboard = await viz.workbook.activateSheetAsync('Overview');

    // Get the worksheet we want to use
    const worksheet = dashboard.worksheets.find((ws) => ws.name === 'SaleMap');

    // Update the parameter
    try {
        const updatedParam = await viz.workbook.changeParameterValueAsync(paramName, paramValue);
        console.log(`Updated parameter: ${updatedParam.name}, ${updatedParam.currentValue.value}`);
    } catch (e) {
        console.error(e.toString());
    }
}
