// 1. Security Check - Redirect if not logged in
document.addEventListener("DOMContentLoaded", () => {
    // Session storage check karna jo Step 1 me set kiya tha
    const isLoggedIn = sessionStorage.getItem('isMDAAdmin');
    
    // Agar current page index.html (login) NAHI hai aur user logged in NAHI hai
    if (!window.location.href.includes('index.html') && isLoggedIn !== 'true') {
        alert("Please login first to access the Admin Panel.");
        window.location.href = 'index.html';
    }
});

// 2. Mobile Menu Toggle Logic
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

if(menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        // Class toggle hone se sidebar ander-bahar hoga CSS ke through
        sidebar.classList.toggle('active');
    });
}

// 3. Logout Logic
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Session clear kar do
        sessionStorage.removeItem('isMDAAdmin');
        // Wapis login page par bhej do
        window.location.href = 'index.html';
    });
}
