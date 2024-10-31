document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", e => { e.preventDefault();

        const { password, email } = form;

        fetch("/api/login", {
             method: "POST",
            headers: { "Content-Type":"application/json" },
            body: `{
                "password":"${ password.value }",
                "email":"${ email.value }"
            }`
        })
        .then(response => response.json())
        .then(result => {
            localStorage["user_token"] = result.token;
            window.location.href = "/";
         });
    });
}); 