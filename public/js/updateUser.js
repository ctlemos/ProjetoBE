document.addEventListener("DOMContentLoaded", () => {
    const userId = "<%= user.user_id %>";
    const userForm = document.getElementById("userForm");

    userForm.addEventListener("submit", e => {
        e.preventDefault();

        const formData = {
            name: userForm.name.value,
            last_name: userForm.last_name.value,
            email: userForm.email.value,
            nif: userForm.nif.value,
            phone: userForm.phone.value,
            address: userForm.address.value,
            postal_code: userForm.postal_code.value,
            city: userForm.city.value
        };

        fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "User updated successfully") {
                alert("Your profile has been updated!");
                // Verifica se foi criado um novo token, e atualiza-o
                if (data.token) {
                    localStorage.setItem('user_token', data.token);
                }
                location.reload();
            } else {
                alert("There was an error updating your profile.");
            }
        })
        .catch(error => console.error("Error updating user:", error));
    });
});