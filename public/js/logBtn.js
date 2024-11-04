// Login & logout
document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = !!localStorage.getItem("user_token"); // Verificar se existe um token
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");

    const register = document.getElementById("register");
    const profile = document.getElementById("profile");

    if (isLoggedIn) {
        // Mostrar lougout btn, esconder login btn
        logoutButton.style.display = "block";
        loginButton.style.display = "none";

        profile.style.display = "block";
        register.style.display = "none";
    } else {
        // Mostrar login btn, esconder logout btn
        loginButton.style.display = "block";
        logoutButton.style.display = "none";

        register.style.display = "block";
        profile.style.display = "none";
    }
});
