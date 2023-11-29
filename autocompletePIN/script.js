/* global bootstrap */
// v.3
import { classIcon, generateTri, classifyNumber, formatPIN } from "./pin-utilities.js";
import { setDeviceType,updateTableauParameter } from "./tableau-utils.js";

let pinService ="https://autocomplete-server-arp6.onrender.com";
if (window.location.hostname === "127.0.0.1" ) {
    pinService = "http://127.0.0.1:3000";
}

document.addEventListener("DOMContentLoaded", function (resultsContainer) {

    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).forEach(function(tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
  
    initAutocomplete();
    setDeviceType();
    attachClearButtonListener(resultsContainer);
    // Fetch the PIN initially
    fetchPin();
    // Set up checkbox event listener
    const checkbox = document.getElementById('flexCheckDefault');
    checkbox.addEventListener('change', onCheckboxChange);
});


// Global variable to store the PIN prefix
let globalPin = null;
let globalPinOK = false;

const debouncedFetchAndDisplay = debounce(fetchAndDisplayResults, 500);

function initAutocomplete() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");
    input.addEventListener("input", function (event) {
        debouncedFetchAndDisplay(event.target.value, resultsContainer);
    });
    input.addEventListener("keydown", (event) => handleInputKeyDown(event, resultsContainer));
}

function handleInputKeyDown(event, resultsContainer) {
    switch (event.key) {
        case "ArrowDown":{
            event.preventDefault(); // Prevent the default input field behavior
            const firstItem = resultsContainer.querySelector(".result-item");
            if (firstItem) {
                firstItem.focus();
            }
            break;}
        case "Enter":{
            event.preventDefault(); // Prevent form submission or other default behavior
            const highlightedFirstItem = resultsContainer.querySelector(".result-item");
            if (highlightedFirstItem) {
                onSelectResultItem({ currentTarget: highlightedFirstItem });
            }
            break;}
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

function fetchAndDisplayResults(inputValue, resultsContainer) {
    if (!inputValue || inputValue.length < 3) {
        resultsContainer.innerHTML = "";
        return;
    }

    showLoadingSpinner();

    // Check the checkbox state and use globalPin if checked
    const checkbox = document.getElementById('flexCheckDefault');
    const pinPrefix = checkbox.checked ? globalPin : null;

    //const requestId = ++currentRequestId;  // Increment and store the current request ID
    let finshed = true;

    console.log(pinPrefix);
    fetchAutocompleteResults(inputValue, pinPrefix)
        .then(data => {
            if (data && finshed && data.length === 0) {
                displayNoResultsMessage(resultsContainer, inputValue);

            } else { 
                displayResults(data, inputValue, resultsContainer);
            } if (data) {hideLoadingSpinner();}
        })
        .catch(error => {
            if (error.name !== 'AbortError') {
                finshed = false;
                handleFetchError(error, resultsContainer);
                hideLoadingSpinner;
            }
            // If it's an AbortError, do not hide the spinner or show error messages,
            // as a new request is likely in progress.
        });
}

function displayNoResultsMessage(resultsContainer, query) {
    const displayQuery = query ? `<i>${query}</i>` : "this search";
    resultsContainer.innerHTML = `<div class="no-results">no result with search "<i>${displayQuery}</i>"</div>`;
}

let currentAbortController = null;

async function fetchAutocompleteResults(queryX, pin) {
    let pinQuery = pin ? `&PIN=${pin}` : "";
    queryX = queryX.replace("=","")
    // Abort the previous request
    if (currentAbortController) {
        currentAbortController.abort();
    }

    // Create a new AbortController for the new request
    currentAbortController = new AbortController();

    try {
        const response = await fetch(`${pinService}/search-endpoint?query=${queryX}${pinQuery}`, {
            signal: currentAbortController.signal
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            throw error; // Rethrow non-abort errors for further handling
        }
    }
}

async function fetchRegion(lat, lon) {
    return fetch(`${pinService}/get-region?lat=${lat}&lon=${lon}`)
        .then(response => response.json());
}

function displayResults(data, inputValue, resultsContainer) {
try {
        let resultsHTML = "";
        if (data) {data.results.forEach(item => {
            resultsHTML += buildResultItemHTML(item, inputValue); // append list footer here 
        });}
        resultsContainer.innerHTML = resultsHTML + resultsFooter(data.totalCount);
        attachResultItemsListeners();
} catch (error) { console.log(error)
}
}

function resultsFooter(resultCount, query) {
    const displayQuery = query ? `<i>${query}</i>` : "this search";
    if (resultCount > 20) {
        return `<div class='result-footer'>Showing 20 of ${resultCount}, try a more specific search</div>`;
    } else if (resultCount === 0) {
        return `<div class="no-results">No result with search "${displayQuery}"</div>`;
    } else {
        return '';
    }
}

function buildResultItemHTML(item, inputValue) {
    const highlightedTaxpayerName = highlightMatch(item.taxpayer, inputValue);
    const highlightedPIN = highlightMatch(formatPIN(item.pin), formatPIN(inputValue));
    const highlightedAddress = highlightMatch(item.address, inputValue);

    return `<div class="d-flex result-item" id="result-item-${item.PIN}" tabindex="0" 
                data-pin="${item.PIN}" 
                data-param="${item.param}" role="option">${classIcon(item.param.split(";")[4])}<button class="result-item" 
                data-param="${item.param}">
            ${highlightedTaxpayerName} | ${highlightedPIN} | ${highlightedAddress}
        </button></div>`;
}

function onSelectResultItem(event) {
    const selectedItem = event.currentTarget;
    //const selectedPIN = selectedItem.getAttribute("data-pin");
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
    showStreetView(selectedItem.innerText.split("|")[2], selectedParam.split(";")[0], selectedParam.split(";")[4]);
}

function showLoadingSpinner() {
    document.querySelector("#loading-spinner").style.display = "block";
    document.querySelector("#clear-button").style.display = "block"; // show clear with a result
}

function hideLoadingSpinner() {
    document.querySelector("#loading-spinner").style.display = "none";
}

function handleFetchError(error) {
    try {
        console.error("Error fetching data:", error);
    } catch {console.error("Error fetching data:", error); }
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
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

function attachClearButtonListener() {
    const clearButton = document.querySelector("#clear-button");
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");
    //console.log(globalPin+ "< global pin")
    clearButton.addEventListener("click", function () {
        input.value = "";
        resultsContainer.innerHTML = "";
        // Do not reset globalPin here
        updateTableauParameter("query", "empty");
        showStreetView(null);
        clearButton.style.display = "none";
        input.focus();
    });
}

function showStreetView(address, taxcode, classNum) {
    const streetViewImage = document.getElementById('streetViewImage');
    const streetViewContainer = document.getElementById('streetViewContainer');
    const streetViewTextContainer = document.getElementById('addressText');
    if (address) {
        const apiKey = 'AIzaSyC4n1tmgSYclPNrfW8BKcgInWwxaW4FBII';
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(address)}&key=${apiKey}`;
        streetViewTextContainer.innerHTML =
            `<address><strong>Address:</strong> ${address}</address><p>
        <strong>Assessment Schedule:</strong> ${generateTri(taxcode)}<p>
        <strong>Classification:</strong> ${classifyNumber(classNum)}`;
        streetViewImage.src = streetViewUrl;
        streetViewContainer.style.display = 'block'; // Ensure the image is visible
    } else {
        streetViewContainer.style.display = 'none'; // Hide the image
    }
}

async function getUserLocation() {
    return new Promise(function (resolve, reject) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                // Success: Resolve the Promise with the location data
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                resolve({ latitude, longitude });
            }, function (error) {
                // Error: Reject the Promise with an error message
                reject("Error getting user's location: " + error.message);
            });
        } else {
            // Geolocation is not supported: Reject the Promise
            reject("Geolocation is not supported in this browser.");
        }
    });
}
// Function to fetch PIN Section
async function fetchPin() {
    try {
        if (globalPinOK) {
            const location = await getUserLocation();
            const pinData = await fetchRegion(location.latitude, location.longitude);
            globalPin = pinData.section;
        }
    } catch (error) {
        console.error("Error fetching PIN:", error);
        globalPin = null;
    }
}

async function onCheckboxChange() {
    const checkbox = document.getElementById('flexCheckDefault');
    const searchQuery = document.getElementById('autocomplete-input').value;
    const resultsContainer = document.querySelector("#autocomplete-list");

    // Only fetch PIN if checkbox is checked and globalPin is not set
    if (checkbox.checked && globalPin == null) {
        globalPinOK = true
        await fetchPin(); // Fetch the PIN
    }
    // Use globalPin if checkbox is checked, otherwise null
    const pinParam = checkbox.checked ? globalPin : null;
    fetchAndDisplayResults(searchQuery, resultsContainer, pinParam);
}