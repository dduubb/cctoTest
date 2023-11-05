// v.10
document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
});

function initAutocomplete() {
    const input = document.querySelector("#autocomplete-input");
    const resultsContainer = document.querySelector("#autocomplete-list");

    // Debounced function
    const debouncedFetchData = debounce(function(e) {
        // Check for space or dash before proceeding
        if (e.code !== 'Space' && e.code !== 'Minus') {
            return; // If the last key pressed is not a space or dash, do nothing.
        }

        const inputValue = formatInput(e.target.value);

        if (inputValue.length < 3) {
            resultsContainer.innerHTML = ''; 
            return;
        }


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
                            ${item.TaxpayerName} - ${formatPIN(item.PIN)} - ${item.Address}
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
                        console.log(selectedData);
                    });
                });

            })
            .catch(error => {
                console.error("Error fetching data:", error);
                resultsContainer.innerHTML = 'Error fetching results';
            });

    }, 300);  // 300ms debounce time

        input.addEventListener("input", function(e) {
        debouncedFetchData(e);
    });

}

function formatInput(value) {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
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
