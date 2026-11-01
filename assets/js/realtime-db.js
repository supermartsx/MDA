// ================= MDA SCHOOL REAL-TIME DATABASE ENGINE =================
const MDA_API_URL = "https://script.google.com/macros/s/AKfycbw8zPvP9Xu069C4TDLn59JPJ-Ezoi7qBwURzt0VofAD6Mu8PKyMraA24-dEBKc6zrkPjA/exec"; // Yahan apni live Web App URL dalein

// 1. Fetch Data (GET)
async function mdaFetchData(moduleName) {
    if (!MDA_API_URL || MDA_API_URL.includes("YOUR_")) {
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    }

    try {
        let response = await fetch(`${MDA_API_URL}?action=${moduleName}`);
        let result = await response.json();
        if (result.status === "success") {
            localStorage.setItem(`mda_${moduleName}`, JSON.stringify(result.data));
            return result.data;
        }
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    } catch (error) {
        console.error("Fetch error:", error);
        return JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    }
}

// 2. Save Data (POST)
async function mdaSaveData(moduleName, payloadObject) {
    // LocalStorage mein backup save karein
    let localData = JSON.parse(localStorage.getItem(`mda_${moduleName}`)) || [];
    localData.push(payloadObject);
    localStorage.setItem(`mda_${moduleName}`, JSON.stringify(localData));

    if (!MDA_API_URL || MDA_API_URL.includes("YOUR_")) {
        return { status: "success", source: "local" };
    }

    try {
        // No-cors mode ya standard text/plain ke sath fetch call
        let response = await fetch(MDA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                action: moduleName,
                payload: payloadObject
            })
        });
        
        let result = await response.json();
        return result;
    } catch (error) {
        console.error("Save error (Saved locally):", error);
        return { status: "success", source: "local_fallback" };
    }
}
