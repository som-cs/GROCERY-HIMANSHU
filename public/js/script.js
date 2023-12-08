document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if we're on the admin dashboard page
});

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            document.cookie = 'jwt=' + data.token
            localStorage.setItem('jwtToken', data.token);
            
            window.location.href = role === 'admin' ? '/admin-dashboard': '/customer-dashboard';
            loadAdminDashboardData()
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch((error) => {
        console.error('Error during login:', error);
        alert('Login failed: ' + error.message);
    });
}

function loadAdminDashboardData() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        redirectToLogin();
        return;
    }

    fetch('/admin-dashboard', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text(); // Use response.text() for HTML content
    })
    .then(html => {
        // Handle the HTML content
        // For example, you might insert it into a specific part of your page
        document.body.innerHTML = html; // Or target a specific element
    })
    .catch(error => {
        console.error('Error fetching admin dashboard:', error);
        redirectToLogin();
    });
}


function displayAdminDashboardData(data) {
    console.log('Admin Dashboard Data:', data);
    // Update the DOM or display data as needed
    // Example: Update the welcome message
    const welcomeContainer = document.getElementById('welcome-container');
    if (welcomeContainer) {
        welcomeContainer.innerHTML = `<h2>Welcome, Admin!</h2><p>${data.welcomeMessage}</p>`;
    }
}

function redirectToLogin() {
    window.location.href = '/login.html'; // Adjust the URL as needed
}
