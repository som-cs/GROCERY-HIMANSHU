document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const email = document.getElementById('email').value;

    // Basic client-side validation for password match
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    // Construct the user object. Exclude email if it's empty.
    const user = { username, password };
    if (email) user.email = email;

    // Send the registration request to your server
    fetch('/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        // Handle response from server
        if (data.message) {
            alert(data.message);
            window.location.href = 'login.html'; // Redirect to login page on successful registration
        } else {
            alert('Registration failed.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    });
});