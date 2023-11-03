document.addEventListener("DOMContentLoaded", function() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    input.addEventListener("input", function(e) {
        const inputValue = e.target.value;

        if (inputValue.length < 3) {
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
                        <div class="result-item">
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
                            PIN: item.PIN,
                            Classification: item.Classification,
                            TaxCode21: item.TaxCode21,
                            TaxCode22: item.TaxCode22,
                            Billed21: item.Billed21,
                            Billed22: item.Billed22
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
