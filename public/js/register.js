document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", e => {
        e.preventDefault();

        const { name, last_name, password, nif, email, phone, address, postal_code, city } = form;

        fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type":"application/json" },
            body: `{
                "name":"${ name.value }",
                "last_name":"${ last_name.value }",
                "password":"${ password.value }",
                "nif":"${ nif.value }",
                "email":"${ email.value }",
                "phone":"${ phone.value }",
                "address":"${ address.value }",
                "postal_code":"${ postal_code.value }",
                "city":"${ city.value }"
            }`
        })
        .then(response => response.json())
        .then(result => {
            console.log("User created:", result);
            alert("You successefully created your account!");
            window.location.href = "/login";
        })
        .catch(error => console.error("Error creating user:", error));
    });
});