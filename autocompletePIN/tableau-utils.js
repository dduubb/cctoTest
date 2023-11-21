// eslint-disable-next-line no-unused-vars
import { TableauEventType } from "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.js";

export function setDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const tableauViz = document.querySelector("tableau-viz");

    if (isMobile) {
        tableauViz.setAttribute("device", "phone");
    } else {
        tableauViz.setAttribute("device", "desktop");
    }
}export async function updateTableauParameter(paramName, paramValue) {
    // Get the viz object from the HTML web component
    const viz = document.querySelector("tableau-viz");
    paramValue = paramValue ?? "10021;10021;8888.88;7777.77"; //fallback

    // Update the parameter
    try {
        const updatedParam = await viz.workbook.changeParameterValueAsync(paramName, paramValue);
        console.log(`Updated parameter: ${updatedParam.name}, ${updatedParam.currentValue.value}`);
    } catch (e) {
        console.error(e.toString());
    }
}

