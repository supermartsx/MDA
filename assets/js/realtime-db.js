// ================= MDA MUSTAFA DIGITAL AI SCHOOL =================
// REAL-TIME DATABASE & AUTOMATED MONTHLY BILLING ENGINE

const FIREBASE_DB_URL = "https://mda-f36d3-default-rtdb.firebaseio.com"; 

/**
 * 1. Fetch Data (Live from Firebase)
 */
async function mdaFetchData(moduleName) {
    if (!FIREBASE_DB_URL) {
        console.error("Firebase URL missing!");
        return [];
    }

    try {
        let response = await fetch(`${FIREBASE_DB_URL}/${moduleName}.json`);
        let data = await response.json();

        if (data) {
            let dataArray = Object.keys(data).map(key => {
                return { firebaseId: key, ...data[key] };
            });
            return dataArray;
        }
        return [];
    } catch (error) {
        console.error(`Firebase Fetch Error on ${moduleName}:`, error);
        return [];
    }
}

/**
 * 2. Save Data (Live to Firebase)
 */
async function mdaSaveData(moduleName, payloadObject) {
    if (!FIREBASE_DB_URL) {
        alert("System Error: Firebase URL is not connected.");
        return { status: "error" };
    }

    try {
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

/**
 * 3. AUTOMATED MONTHLY FEE BILLING ENGINE
 * Har mahine bache ki fees auto pending mein add karta hai agar naya mahina shuru ho jaye.
 */
async function autoProcessMonthlyBilling() {
    try {
        // Current Year & Month nikalna (e.g. "2026-11")
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Session check taake ek hi browser session mein bar bar update call na ho
        if (sessionStorage.getItem('mda_billed_cycle') === currentMonthKey) {
            return;
        }

        // Live students aur fee structures fetch karna
        const [students, feeStructures] = await Promise.all([
            mdaFetchData('students'),
            mdaFetchData('fee_structures')
        ]);

        if (!students || students.length === 0) return;

        let billingUpdated = false;

        for (let student of students) {
            if (!student.firebaseId) continue;

            // Bache ka aakhri billed month check karna
            let lastBilled = student.lastBilledMonth || "";

            // Agar student ko is naye mahine ka bill nahi laga:
            if (lastBilled !== currentMonthKey) {
                // Class ki monthly fee dhoondna (Fallback Rs. 5000)
                let monthlyFee = 5000;
                let matchedStructure = feeStructures.find(f => (f.class || '').trim() === (student.class || '').trim());
                if (matchedStructure && matchedStructure.amount) {
                    monthlyFee = parseFloat(matchedStructure.amount);
                }

                let currentPending = parseFloat(student.pendingDue || 0);
                let newTotalPending = currentPending + monthlyFee; // Purani pending + Naye mahine ki fees

                // Firebase mein bache ka record live update karna
                await fetch(`${FIREBASE_DB_URL}/students/${student.firebaseId}.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pendingDue: newTotalPending,
                        lastBilledMonth: currentMonthKey
                    })
                });

                billingUpdated = true;
                console.log(`[Auto-Billing] Month: ${currentMonthKey} | Student: ${student.fullName || student.name} | Added: Rs. ${monthlyFee} | New Due: Rs. ${newTotalPending}`);
            }
        }

        // Cycle complete mark karna
        sessionStorage.setItem('mda_billed_cycle', currentMonthKey);

        if (billingUpdated) {
            console.log("Monthly fee cycle updated successfully for all students.");
        }
    } catch (err) {
        console.error("Monthly billing engine error:", err);
    }
}

// Jab bhi koi page load ho, auto-billing check run ho
document.addEventListener('DOMContentLoaded', () => {
    // Sirf admin dashboard aur fee collection par automatically run kare
    if (window.location.href.includes('dashboard.html') || window.location.href.includes('fee-collection.html') || window.location.href.includes('quick-fee.html')) {
        autoProcessMonthlyBilling();
    }
});
