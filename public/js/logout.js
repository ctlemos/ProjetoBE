document.getElementById("logoutButton").addEventListener("click", async () => {
    //console.log(localStorage.getItem("user_token")); //debug para ver se o token existe

    // enviar POST request
    const response = fetch("/logout", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("user_token"),
            "Content-Type": "application/json"
        } 
    }) .then(response => response.json()).then( 
        result => {
            if (result.message) {
                // limpa o token do localStorage
                localStorage.removeItem("user_token");
                // redireciona oara a login page
                window.location.href = "/login";
            } else {
                alert("Logout failed. Please try again.");
            } 
        }
    );
});
