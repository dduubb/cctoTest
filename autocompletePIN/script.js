document.addEventListener("DOMContentLoaded", function() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    input.addEventListener("input", function(e) {
        const inputValue = e.target.value.trim(); // Added trim to ensure spaces at start/end are removed
        const lastChar = inputValue.charAt(inputValue.length - 1);

        // Only fetch suggestions if the last character is a space, '-' or if inputValue length is >= 3
        if ((lastChar !== ' ' && lastChar !== '-') || inputValue.length < 3) {
            resultsContainer.innerHTML = ''; // clear previous results if they exist
            return;
        }

        // Fetch data from the server
        fetch(`https://autocomplete-server-arp6.onrender.com/search-endpoint?query=${inputValue}`)
            .then(response => response.json())
            .then(data => {
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

                // If you want to add event listeners to each result item
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
                        console.log(selectedData);
                    });
                });

            })
            .catch(error => {
                console.error("Error fetching data:", error);
                resultsContainer.innerHTML = 'Error fetching results';
            });
    });
});
