// v.12

import { TableauEventType } from "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.js";
const pinService = "https://autocomplete-server-arp6.onrender.com";


const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl, {
    html: true  // Enable HTML content inside the tooltip
  });
});




document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
    setDeviceType();
    
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
    input.addEventListener("input", function(event) {
        debouncedFetchAndDisplay(event.target.value, resultsContainer);
        //debouncedFetchAndDisplay(event, resultsContainer);
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


function fetchAndDisplayResults(inputValue, resultsContainer) {
    if (!inputValue || inputValue.length < 3) {
        resultsContainer.innerHTML = "";
        return;
    }

    showLoadingSpinner();

    // Check the checkbox state and use globalPin if checked
    const checkbox = document.getElementById('flexCheckDefault');
    const pinPrefix = checkbox.checked ? globalPin : null;

    console.log(pinPrefix);
    fetchAutocompleteResults(inputValue, pinPrefix)
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
    const displayQuery = query ? `<i>${query}</i>` : "this search";
    resultsContainer.innerHTML = `<div class="no-results">no result with search "<i>${displayQuery}</i>"</div>`;
}

async function fetchAutocompleteResults(queryX,pin) {
    let pinQuery = ""
     if (pin) {
         pinQuery = `&PIN=${pin}`
    } else pinQuery =""
    //console.log(`pinQuery is ${pinQuery}`) 

    return fetch(`${pinService}/search-endpoint?query=${queryX}`+`${pinQuery}`)
           .then(response => response.json());
}

async function fetchRegion(lat,lon) {
    return fetch(`${pinService}/get-region?lat=${lat}&lon=${lon}`)
           .then(response => response.json());
}

function displayResults(data,inputValue, resultsContainer) {
    let resultsHTML = "";
    data.results.forEach(item => {
        resultsHTML += buildResultItemHTML(item, inputValue) ; // append list footer here 
    });
    resultsContainer.innerHTML = resultsHTML+ resultsFooter(data.totalCount);
    attachResultItemsListeners();
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
    const highlightedTaxpayerName = highlightMatch(item.TaxPayer, inputValue);
    const highlightedPIN = highlightMatch(formatPIN(item.PIN), formatPIN(inputValue));
    const highlightedAddress = highlightMatch(item.Address, inputValue);

    return `<div class="d-flex result-item" id="result-item-${item.PIN}" tabindex="0" 
                data-pin="${item.PIN}" 
                data-param="${item.param}" role="option">${classIcon(item.param.split(";")[4])}<button class="result-item" 
                data-param="${item.param}"
>
            ${highlightedTaxpayerName} | ${highlightedPIN} | ${highlightedAddress}
        </button></div>`;
}

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
    showStreetView(selectedItem.innerText.split("|")[2],selectedParam.split(";")[0],selectedParam.split(";")[4]);
    
}

function showLoadingSpinner() {
    document.querySelector("#loading-spinner").style.display = "block";
    document.querySelector("#clear-button").style.display = "block"; // show clear with a result

}

function hideLoadingSpinner() {
    document.querySelector("#loading-spinner").style.display = "none";
}

function handleFetchError(error , resultsContainer) {
    try {console.error("Error fetching data:", error);
    resultsContainer.innerHTML = `<div class="no-results">no result with this search </div>`;
} catch {}
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
        tableauViz.setAttribute("device", "phone");
    } else {
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
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");
    //console.log(globalPin+ "< global pin")
    clearButton.addEventListener("click", function() {
        input.value = "";
        resultsContainer.innerHTML = "";
        // Do not reset globalPin here
        updateTableauParameter("query", "empty");
        showStreetView(null);
        clearButton.style.display = "none";
        input.focus();
    });
}




async function updateTableauParameter(paramName, paramValue) {
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

function generateTri(param){
    const taxcodeCheat = param.slice(0, 2)
    return taxcodeCheat.substring(0, 1) === "7" ? "City, reassessed in Tax Year 2021 next in 2024"
    : [10, 16, 17, 18, 20, 22, 23, 24, 25, 26, 29, 35, 38].includes(parseInt(taxcodeCheat.substring(0, 2)))
    ? "North, reassessed in Tax Year 2022 next in 2025"
    : "South, reassessed in Tax Year 2020 next in 2023";
}

function classifyNumber(n) {
    const C = ["Exempt", "Vacant", "Residential", "Multifamily", "Commercial", "Industrial", "Unknown"];
  
    for (let i = 0; i < C.length; i++) {
      if ((i === 0 && n >= 0 && n <= 99) ||
          (i === 1 && n >= 100 && n <= 199) ||
          (i === 2 && n >= 200 && n <= 299) ||
          (i === 3 && n >= 300 && n <= 399) ||
          ((i === 4 || i === 6) && ((n >= 400 && n <= 417) || n === 418 || n >= 419 && n <= 449 || n === 497 || (n >= 498 && n <= 499) || (n >= 500 && n <= 549) || n >= 590 && n <= 592 || n >= 594 && n <= 599 || n >= 700 && n <= 799 || n >= 800 && n <= 849 || (n >= 891 && n <= 892) || (n >= 894 && n <= 899))) ||
          ((i === 5 || i === 6) && ((n >= 450 && n <= 489) || n === 493 || (n >= 550 && n <= 589) || n === 593 || (n >= 600 && n <= 637) || n === 638 || n >= 639 && n <= 699 || n >= 850 && n <= 890 || n === 893)) ||
          ((i === 4 || i === 6) && ((n >= 494 && n <= 496) || (n >= 900 && n <= 999)))) {
        return C[i];
      }
    }
    return C[C.length - 1];
  }  

  function classIcon(classNum){
    const propertyTypes = {
        Exempt: '<i class="fa-solid fa-place-of-worship"></i>',
        Vacant: '<i class="fa-regular fa-circle-xmark"></i>',
        Commercial: '<i class="fa-solid fa-shop"></i>',
        Residential: '<i class="fa-solid fa-house"></i>',
        Multifamily: '<i class="fa-solid fa-building"></i>',
        Industrial: '<i class="fa-solid fa-industry"></i>',
        Unknown: '<i class="fa-solid fa-industry"></i>'
      };
    const mClass = classifyNumber(classNum)
    return propertyTypes[mClass]
  }

function showStreetView(address,taxcode,classNum) {
    const streetViewImage = document.getElementById('streetViewImage');
    const streetViewContainer = document.getElementById('streetViewContainer');
    const streetViewTextContainer = document.getElementById('addressText');
    if (address) {
        const apiKey = 'AIzaSyC4n1tmgSYclPNrfW8BKcgInWwxaW4FBII'; // Replace with your API key
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(address)}&key=${apiKey}`;
        streetViewTextContainer.innerHTML= 
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
  return new Promise(function(resolve, reject) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async function(position) {
        // Success: Resolve the Promise with the location data
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        resolve({ latitude, longitude });
      }, function(error) {
        // Error: Reject the Promise with an error message
        reject("Error getting user's location: " + error.message);
      });
    } else {
      // Geolocation is not supported: Reject the Promise
      reject("Geolocation is not supported in this browser.");
    }
  });
}


  
// Function to fetch PIN
async function fetchPin() {
    try {
        if (globalPinOK) {const location = await getUserLocation();
        const pinData = await fetchRegion(location.latitude, location.longitude);
        globalPin = pinData.section; }
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



// Fetch PIN independently
document.addEventListener("DOMContentLoaded", function() {
    fetchPin();

    // Set up checkbox event listener
    const checkbox = document.getElementById('flexCheckDefault');
    checkbox.addEventListener('change', onCheckboxChange);
});