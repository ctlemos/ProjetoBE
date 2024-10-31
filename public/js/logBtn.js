document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = !!localStorage.getItem("user_token"); // verificar se existe um token
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");

    if (isLoggedIn) {
        // mostrar lougout btn, esconder login btn
        logoutButton.style.display = "block";
        loginButton.style.display = "none";
    } else {
        // mostrar login btn, esconder logout btn
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }
});