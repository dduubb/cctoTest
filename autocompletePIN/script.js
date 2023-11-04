// client script .06
document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded!");  

    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    // Function to fetch the data from the server
    function fetchData(queryValue) {
        let fieldParam = '';  
        if (queryValue.includes('-')) {
            fieldParam = '&field=PIN';
        }

        const fetchURL = `https://autocomplete-server-arp6.onrender.com/search-endpoint?query=${queryValue}${fieldParam}`;
        console.log(`Fetching from: ${fetchURL}`);

        fetch(fetchURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Received data:", data);  

                let resultsHTML = '';
                data.forEach(item => {
                    resultsHTML += `
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
                });

                resultsContainer.innerHTML = resultsHTML;

                const resultItems = document.querySelectorAll(".result-item");
                resultItems.forEach(item => {
                    item.addEventListener("click", function() {
                        const selectedData = {
                            PIN: this.getAttribute("data-pin"),
                            Classification: this.getAttribute("data-classification"),
                            TaxCode21: this.getAttribute("data-taxcode21"),
                            TaxCode22: this.getAttribute("data-taxcode22"),
                            Billed21: this.getAttribute("data-billed21"),
                            Billed22: this.getAttribute("data-billed22")
                        };
                        console.log("Selected item data:", selectedData);
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching data:", error.message);
                resultsContainer.innerHTML = 'Error fetching results';
            });
    }

    // Event listener for input change
    input.addEventListener("input", function(e) {
        const inputValue = e.target.value.trim();
        const lastChar = inputValue.charAt(inputValue.length - 1);

        // Only fetch suggestions if the last character is a space, '-' or if inputValue length is >= 3
        if ((lastChar !== ' ' && lastChar !== '-') || inputValue.length < 3) {
            resultsContainer.innerHTML = ''; 
            return;
        }

        fetchData(inputValue);
    });

    // Event listener for the test button
    const testButton = document.querySelector("#testButton");
    testButton.addEventListener("click", function() {
        console.log("Test button clicked");
        fetchData("sample-test-value"); // Use a hardcoded value or input's value for testing
    });
});
