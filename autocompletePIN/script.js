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
    data.results.forEach(item => {
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
    showStreetView(selectedItem.innerText.split("|")[2],selectedParam.split(";")[0],selectedParam.split(";")[4]);
    
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
    const input = document.querySelector("#autocomplete-input"); // Get the input field
    const resultsContainer = document.querySelector("#autocomplete-list"); // Define it here
 
    clearButton.addEventListener("click", function() {
        document.querySelector("#autocomplete-input").value = "";
        updateTableauParameter("query", "empty");
        resultsContainer.innerHTML = "";
        showStreetView(null);
        clearButton.style.display = "none"; // show clear with a result
        input.focus(); // Set focus back to the input field
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

// Usage:
async function getLocationAndDoSomething() {
    try {
      const location = await getUserLocation();
      // Location retrieval was successful
      console.log("Latitude: " + location.latitude);
      console.log("Longitude: " + location.longitude);
      
      // Perform other asynchronous operations here if needed
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  };
  
  document.addEventListener("DOMContentLoaded", function() {
    // Get references to the radio button and loading spinner
    var locationRadio = document.getElementById("location-radio");
    var loadingSpinner = document.getElementById("loading-spinner");
  
    // Add a click event listener to the radio button
    locationRadio.addEventListener("click", async function() {
      // Toggle the loading spinner
      loadingSpinner.style.display = "inline-block";
  
      try {
        // Call the async function when the radio button is clicked
        await getLocationAndDoSomething();
      } catch (error) {
        // Handle errors if necessary
        console.error(error);
      } finally {
        // Toggle off the loading spinner when done
        loadingSpinner.style.display = "none";
      }
    });
  });
  