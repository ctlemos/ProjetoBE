function viewUser() {
    const token = localStorage.getItem('user_token');
    if (!token) {
        alert("Please log in to view your Profile.");
        return;
    }

    fetch('/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.text()) 
    .then(html => {
         document.body.innerHTML = html; 
    })
    .catch(error => {
        console.error("Error accessing your Profile:", error);
        alert("Unable to access Profile.");
    });
} 