export function generateTri(taxcode) {
    return taxcode.substring(0, 1) === "7" ? "City, reassessed in Tax Year 2021 next in 2024"
        : [10, 16, 17, 18, 20, 22, 23, 24, 25, 26, 29, 35, 38].includes(parseInt(taxcode.substring(0, 2)))
            ? "North, reassessed in Tax Year 2022 next in 2025"
            : "South, reassessed in Tax Year 2020 next in 2023";
}

export function classifyNumber(n) {
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

export function classIcon(classNum) {
    const propertyTypes = {
        Exempt: '<i class="fa-solid fa-place-of-worship"></i>',
        Vacant: '<i class="fa-regular fa-circle-xmark"></i>',
        Commercial: '<i class="fa-solid fa-shop"></i>',
        Residential: '<i class="fa-solid fa-house"></i>',
        Multifamily: '<i class="fa-solid fa-building"></i>',
        Industrial: '<i class="fa-solid fa-industry"></i>',
        Unknown: '<i class="fa-solid fa-industry"></i>'
    };
    const mClass = classifyNumber(classNum);
    return propertyTypes[mClass];
}

export function formatPIN(pin) {
    return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
}

