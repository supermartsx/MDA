// ================= MDA SCHOOL FIREBASE REAL-TIME ENGINE =================

// ⚠️ Yahan apna Firebase Realtime Database ka URL paste karein:
// (Aakhir mein slash '/' nahi lagana)
const FIREBASE_DB_URL = "https://mda-f36d3-default-rtdb.firebaseio.com/"; 

/**
 * 1. Fetch Data (Live from Firebase)
 */
async function mdaFetchData(moduleName) {
    if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes("YOUR-PROJECT-ID")) {
        console.error("Firebase URL missing!");
        return [];
    }

    try {
        // Firebase REST API requires .json at the end
        let response = await fetch(`${FIREBASE_DB_URL}/${moduleName}.json`);
        let data = await response.json();

        if (data) {
            // Firebase data ko Object se Array mein convert karna taake HTML tables mein theek show ho
            let dataArray = Object.keys(data).map(key => {
                return { firebaseId: key, ...data[key] };
            });
            return dataArray;
        }
        return []; // Agar database khali hai
    } catch (error) {
        console.error("Firebase Fetch Error:", error);
        return [];
    }
}

/**
 * 2. Save Data (Live to Firebase)
 */
async function mdaSaveData(moduleName, payloadObject) {
    if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes("YOUR-PROJECT-ID")) {
        alert("System Error: Firebase URL is not connected.");
        return { status: "error" };
    }

    try {
        // Firebase POST request auto-generates a unique secure ID
        let response = await fetch(`${FIREBASE_DB_URL}/${moduleName}.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payloadObject)
        });
        
        let result = await response.json();
        
        if (result.name) {
            return { status: "success", id: result.name };
        } else {
            return { status: "error" };
        }
    } catch (error) {
        console.error("Firebase Save Error:", error);
        return { status: "error", message: error.toString() };
    }
}
