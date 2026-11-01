// ================= MDA SCHOOL REAL-TIME DATABASE BRIDGE =================
const MDA_API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"; // Yahan apni Apps Script URL paste karein

// 1. Fetch Real-Time Data from Google Sheet
async function mdaFetchData(moduleName) {
    if (!MDA_API_URL || MDA_API_URL.includes("YOUR_")) {
        // Fallback to LocalStorage agar API URL na ho
        console.warn("Using LocalStorage fallback for " + moduleName);
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    }

    try {
        let response = await fetch(`${MDA_API_URL}?action=${moduleName}`);
        let result = await response.json();
        if (result.status === "success") {
            // Local cache bhi update kar do taake offline chal sake
            localStorage.setItem(`mda_${moduleName}`, JSON.stringify(result.data));
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching real-time data:", error);
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    }
}

// 2. Save Real-Time Data to Google Sheet
async function mdaSaveData(moduleName, payloadObject) {
    // LocalStorage mein foran save karo (Instant UI response ke liye)
    let localData = JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    localData.push(payloadObject);
    localStorage.setItem(`mda_${moduleName}`, JSON.stringify(localData));

    if (!MDA_API_URL || MDA_API_URL.includes("YOUR_")) {
        return { status: "success", source: "local" };
    }

    try {
        let response = await fetch(MDA_API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: moduleName,
                payload: payloadObject
            })
        });
        let result = await response.json();
        return result;
    } catch (error) {
        console.error("Error saving real-time data:", error);
        return { status: "error", message: error.toString() };
    }
}
