// v.03
document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
});

function formatPIN(pin) {
    // Assuming PIN is a string like "12345678901234"
    const parts = [
        pin.substr(0, 2),
        pin.substr(2, 2),
        pin.substr(4, 3),
        pin.substr(7, 3),
        pin.substr(10, 4)
    ];
    return parts.join('-');
}


function initAutocomplete() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    input.addEventListener("input", handleInput);

    function handleInput(e) {
        const inputValue = e.target.value;

        if (shouldFetchData(inputValue)) {
            fetchData(inputValue, resultsContainer);
        } else {
            resultsContainer.innerHTML = '';
        }
    }

    function shouldFetchData(value) {
        return value.length >= 3; // You can adjust this condition as needed
    }

    function fetchData(query, container) {
        const endpoint = `https://autocomplete-server-arp6.onrender.com/search-endpoint?query=${query}`;
        
        fetch(endpoint)
            .then(handleFetchResponse)
            .then(data => displayResults(data, container))
            .catch(handleFetchError);
    }

    function handleFetchResponse(response) {
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    }

    function displayResults(data, container) {
        let resultsHTML = '';
        data.forEach(item => {
            resultsHTML += generateResultHTML(item);
        });

        container.innerHTML = resultsHTML;
        addClickListenersToResults();
    }

    function generateResultHTML(item) {
        return `
            <div class="result-item" 
                 data-pin="${item.PIN}" 
                 data-classification="${item.Classification}" 
                 data-taxcode21="${item.TaxCode21}"
                 data-taxcode22="${item.TaxCode22}"
                 data-billed21="${item.Billed21}"
                 data-billed22="${item.Billed22}">
                ${item.TaxpayerName} - ${item.PIN} - ${item.Address}
            </div>
        `;
    }

    function addClickListenersToResults() {
        const resultItems = document.querySelectorAll(".result-item");
        resultItems.forEach(item => {
            item.addEventListener("click", handleResultClick);
        });
    }

    function handleResultClick() {
        const selectedData = {
            PIN: this.getAttribute("data-pin"),
            Classification: this.getAttribute("data-classification"),
            TaxCode21: this.getAttribute("data-taxcode21"),
            TaxCode22: this.getAttribute("data-taxcode22"),
            Billed21: this.getAttribute("data-billed21"),
            Billed22: this.getAttribute("data-billed22")
        };
        console.log(selectedData);
    }

    function handleFetchError(error) {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = 'Error fetching results';
    }
}
