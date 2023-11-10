// v.12

import { TableauEventType } from "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.js";

document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
    setDeviceType();
});

const debouncedFetchAndDisplay = debounce(fetchAndDisplayResults, 400);

function initAutocomplete() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");
    input.addEventListener("input", function(event) {
        debouncedFetchAndDisplay(event, resultsContainer);
    });
    input.addEventListener("keydown", (event) => handleInputKeyDown(event, resultsContainer));

}

function handleInputKeyDown(event, resultsContainer) {
    switch (event.key) {
        case "ArrowDown":
            event.preventDefault(); // Prevent the default input field behavior
            const firstItem = resultsContainer.querySelector(".result-item");
            if (firstItem) {
                firstItem.focus();
            }
            break;
        case "Enter":
            event.preventDefault(); // Prevent form submission or other default behavior
            const highlightedFirstItem = resultsContainer.querySelector(".result-item");
            if (highlightedFirstItem) {
                onSelectResultItem({ currentTarget: highlightedFirstItem });
            }
            break;
    }
}


function attachResultItemsListeners() {
    const resultItems = document.querySelectorAll(".result-item");
    resultItems.forEach(item => {
        item.addEventListener("click", onSelectResultItem);
        item.addEventListener("keydown", handleItemKeyDown);
    });
}

function handleItemKeyDown(event) {
    const item = event.target;
    let newItemToFocus;

    switch (event.key) {
        case "ArrowDown":
            newItemToFocus = item.nextElementSibling;
            break;
        case "ArrowUp":
            newItemToFocus = item.previousElementSibling;
            break;
        case "Enter":
            // Trigger selection logic
            onSelectResultItem(event);
            break;
    }

    if (newItemToFocus) {
        newItemToFocus.focus();
        event.preventDefault(); // Prevents the default scrolling behavior
    }
}

function fetchAndDisplayResults(event, resultsContainer) {
    const inputValue = formatInput(event.target.value);
    if (inputValue.length < 3) {
        resultsContainer.innerHTML = "";
        return;
    }

    showLoadingSpinner();
    fetchAutocompleteResults(inputValue)
        .then(data => {
            if (data.length === 0) {
                displayNoResultsMessage(resultsContainer, inputValue);
            } else {
                displayResults(data, inputValue, resultsContainer);
            }
        })
        .catch(error => handleFetchError(error, resultsContainer))
        .finally(hideLoadingSpinner);
}

function displayNoResultsMessage(resultsContainer, query) {
    resultsContainer.innerHTML = `<div class="no-results">no result with search "<i>${query}</i>"</div>`;
}

async function fetchAutocompleteResults(query) {
    return fetch(`https://autocomplete-server-arp6.onrender.com/search-endpoint?query=${query}`)
           .then(response => response.json());
}

function displayResults(data,inputValue, resultsContainer) {
    let resultsHTML = "";
    data.forEach(item => {
        resultsHTML += buildResultItemHTML(item, inputValue);
    });
    resultsContainer.innerHTML = resultsHTML;
    attachResultItemsListeners();
}

function buildResultItemHTML(item, inputValue) {
    const highlightedTaxpayerName = highlightMatch(item.TaxPayer, inputValue);
    const highlightedPIN = highlightMatch(formatPIN(item.PIN), formatPIN(inputValue));
    const highlightedAddress = highlightMatch(item.Address, inputValue);

    return `<button class="result-item" 
                role="option"
                id="result-item-${item.PIN}"
                data-pin="${item.PIN}" 
                data-param="${item.param}">
            ${highlightedTaxpayerName} | ${highlightedPIN} | ${highlightedAddress}
        </button>`;
}

/* function attachResultItemsListeners() {
    document.querySelectorAll(".result-item").forEach(item => {
        item.addEventListener("click", onSelectResultItem);
    });
} */

function onSelectResultItem(event) {
    const selectedItem = event.currentTarget;
    const selectedPIN = selectedItem.getAttribute("data-pin");
    const selectedParam = selectedItem.getAttribute("data-param");

    // Update the input field with a relevant value from the selected item
    const input = document.querySelector("#autocomplete-input");
    input.value = selectedItem.innerText.replace(/(\|[^|]*)\|/, '$1 | Address: ').replace('|', ' | PIN: ');//.split(' | '); // or any other relevant part of the innerText

    // Hide the autocomplete list
    const resultsContainer = document.querySelector("#autocomplete-list");
    resultsContainer.innerHTML = '';

    // Perform additional actions
    // For example, updating Tableau parameter based on the selection
    updateTableauParameter("query", selectedParam || "default value");

    // Any other logic that needs to run after an item is selected
}

function showLoadingSpinner() {
    document.querySelector("#loading-spinner").style.display = "block";
    document.querySelector("#clear-button").style.display = "block"; // show clear with a result

}

function hideLoadingSpinner() {
    document.querySelector("#loading-spinner").style.display = "none";
}

function handleFetchError(error , resultsContainer) {
    console.error("Error fetching data:", error);
    resultsContainer.innerHTML = "Error fetching results";
}

function formatInput(value) {
    return value.replaceAll("-","").trim().replace(/\s+/g, " ").toLowerCase();
}

function formatPIN(pin) {
    return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
}

function highlightMatch(text, term) {
    const startIndex = text.toLowerCase().indexOf(term.toLowerCase());
    if (startIndex >= 0) {
      const endLength = term.length;
      const matchingText = text.substr(startIndex, endLength);
      return text.substring(0, startIndex) + "<strong>" + matchingText + "</strong>" + text.substring(startIndex + endLength);
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

function setDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const tableauViz = document.querySelector("tableau-viz");

    if (isMobile) {
        console.log("mobile");
        tableauViz.setAttribute("device", "phone");
    } else {
        console.log("desktop");
        tableauViz.setAttribute("device", "desktop");
    }
}

document.addEventListener("DOMContentLoaded", function(resultsContainer) {
    initAutocomplete();
    setDeviceType();
    attachClearButtonListener(resultsContainer);
});

function attachClearButtonListener() {
    const clearButton = document.querySelector("#clear-button");
    const input = document.querySelector("#autocomplete-input"); // Get the input field
    const resultsContainer = document.querySelector("#autocomplete-list"); // Define it here
 
    clearButton.addEventListener("click", function() {
        document.querySelector("#autocomplete-input").value = "";
        updateTableauParameter("query", "empty");
        resultsContainer.innerHTML = "";
        clearButton.style.display = "none"; // show clear with a result
        input.focus(); // Set focus back to the input field
    });
}

async function updateTableauParameter(paramName, paramValue) {
    console.log(`updatePram will run with ${paramName} and ${paramValue}`);
    // Get the viz object from the HTML web component
    const viz = document.querySelector("tableau-viz");
    paramValue = paramValue ?? "10021;10021;8888.88;7777.77" //fallback
    // Update the parameter
    try {
        const updatedParam = await viz.workbook.changeParameterValueAsync(paramName, paramValue);
        console.log(`Updated parameter: ${updatedParam.name}, ${updatedParam.currentValue.value}`);
    } catch (e) {
        console.error(e.toString());
    }
}