// ================= MDA SCHOOL REAL-TIME DATABASE ENGINE =================
// Yahan apni Google Apps Script ki deploy ki hui Web App URL paste karein:
const MDA_API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

/**
 * 1. Fetch Real-Time Data from Google Sheet
 * @param {string} moduleName - Sheet ka naam (maslan: students, settings, fees, expenses, notices)
 */
async function mdaFetchData(moduleName) {
    if (!MDA_API_URL || MDA_API_URL.includes("YOUR_")) {
        console.warn("MDA API URL missing. Falling back to LocalStorage for: " + moduleName);
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    }

    try {
        let response = await fetch(`${MDA_API_URL}?action=${moduleName}`);
        let result = await response.json();
        
        if (result.status === "success") {
            // Local cache update kar do taake offline ya fast load ho sake
            localStorage.setItem(`mda_${moduleName}`, JSON.stringify(result.data));
            return result.data;
        } else {
            console.warn(`API returned error for ${moduleName}:`, result.message);
            return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
        }
    } catch (error) {
        console.error("Network or Fetch error, using LocalStorage fallback:", error);
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    }
}

/**
 * 2. Save Real-Time Data to Google Sheet
 * @param {string} moduleName - Sheet ka naam (maslan: students, expenses)
 * @param {Object} payloadObject - Data object jo save karna hai
 */
async function mdaSaveData(moduleName, payloadObject) {
    // 1. Instant UI update ke liye LocalStorage mein foran save karein
    let localData = JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    localData.push(payloadObject);
    localStorage.setItem(`mda_${moduleName}`, JSON.stringify(localData));

    if (!MDA_API_URL || MDA_API_URL.includes("YOUR_")) {
        console.warn("Saved to LocalStorage only (API URL not configured).");
        return { status: "success", source: "local" };
    }

    try {
        let response = await fetch(MDA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // Google Apps Script CORS bypass trick
            },
            body: JSON.stringify({
                action: moduleName,
                payload: payloadObject
            })
        });
        let result = await response.json();
        return result;
    } catch (error) {
        console.error("Error saving data to Google Sheet:", error);
        return { status: "error", message: error.toString() };
    }
}
