const data = [
    {
        "PIN": "33311000020000",
        "Classification": "592",
        "TaxpayerName": "BOB SMITH",
        "Address": "231 W MAIN ST BARRINGTON, IL 600104205",
        "TaxCode21": "10101",
        "TaxCode22": "10101",
        "Billed21": 16477.58,
        "Billed22": 14235.33
    },
    {
        "PIN": "01011003330000",
        "Classification": "592",
        "TaxpayerName": "LINDA DAN",
        "Address": "223 W MAIN ST BARRINGTON, IL 600104205",
        "TaxCode21": "10101",
        "TaxCode22": "10101",
        "Billed21": 30086.35,
        "Billed22": 27440.53
    }
];

const input = document.getElementById("autocomplete-input");
const list = document.getElementById("autocomplete-list");

input.addEventListener('input', function() {
    let val = this.value;
    list.innerHTML = '';  // Clear existing list items

    if (!val || val.length < 3) return false;  // Wait until user has typed at least 3 characters

    for (let item of data) {
        let taxName = item.TaxpayerName.toLowerCase();
        let pin = item.PIN.toLowerCase();
        let address = item.Address.toLowerCase();
        let searchVal = val.toLowerCase();

        if (taxName.includes(searchVal) || pin.includes(searchVal) || address.includes(searchVal)) {
            let div = document.createElement("div");
            div.className = 'list-group-item list-group-item-action';
            div.innerHTML = `<strong>${item.TaxpayerName}</strong> | ${item.PIN} | ${item.Address}`;
            div.addEventListener('click', function() {
                input.value = item.TaxpayerName;  // Assigning TaxpayerName to input for better UX
                list.innerHTML = '';  // Clear the list

                let selectedData = {
                    "PIN": item.PIN,
                    "Classification": item.Classification,
                    "TaxCode21": item.TaxCode21,
                    "TaxCode22": item.TaxCode22,
                    "Billed21": item.Billed21,
                    "Billed22": item.Billed22
                };

                console.log(selectedData); // Logging the selected data to the console
            });
            list.appendChild(div);
        }
    }
});

document.addEventListener('click', function(e) {
    if(e.target !== input) {
        list.innerHTML = '';  // Clear the list if clicked outside
    }
});
