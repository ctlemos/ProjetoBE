document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", e => {
        e.preventDefault();

        const { password, email } = form;

        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password: password.value,
                email: email.value
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message); 
                });
            }
            return response.json();
        })
        .then(result => {
            if (result.token) {
                localStorage.setItem("user_token", result.token); // Guardar token se existir
                window.location.href = "/"; // Redirecionar se o login estiver correto
            }
        })
        .catch(error => {
            alert(`Login failed: ${error.message}`); 
        });
    });
});