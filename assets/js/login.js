document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Page refresh hone se rokega

    const enteredPassword = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('errorMessage');

    // JSON file ko fetch kar raha hai
    fetch('admin.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Password Check karna
            if (enteredPassword === data.password) {
                // Password match ho gaya!
                errorDiv.style.display = 'none';
                
                // Session mein save kar lein taake andar pages par check kar sakein
                sessionStorage.setItem('isMDAAdmin', 'true');
                
                // Dashboard par bhej dein (Ye page hum next step mein banayenge)
                window.location.href = 'dashboard.html'; 
            } else {
                // Password galat hai
                errorDiv.style.display = 'block';
                document.getElementById('adminPassword').value = ''; // field clear kar do
            }
        })
        .catch(error => {
            console.error('Error reading JSON:', error);
            alert("Error: admin.json file read nahi ho saki. Localhost / GitHub par host karein.");
        });
});
