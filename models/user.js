function validateUser(user) {
    if (!user.name || user.name.length < 3 || user.name.length > 255) {
        return "Name must be between 3 and 255 characters.";
    }

    if (!user.last_name || user.last_name.length < 3 || user.last_name.length > 255) {
        return "Last Name must be between 3 and 255 characters.";
    }

    //apelo menos: 8 letras, 1 numero, 1 letra maiúscula)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!user.password || !passwordRegex.test(user.password)) {
        return "Password must be at least 8 characters long and contain at least one letter and one number.";
    }

    const nifRegex = /^\d{9}$/;
    if (!user.nif || !nifRegex.test(user.nif)) {
        return "NIF must be a valid 9-digit number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
        return "Email must be a valid email address.";
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!user.phone || !phoneRegex.test(user.phone)) {
        return "Phone number must be a valid international or local phone number.";
    }

    if (!user.address || user.address.length > 255) {
        return "Address must not be empty and must be less than 255 characters.";
    }

    const postalCodeRegex = /^\d{4}-\d{3}$/;
    if (!user.postal_code || !postalCodeRegex.test(user.postal_code)) {
        return "Postal code must be in the format xxxx-xxx (8 digits with a hyphen).";
    }

    if (!user.city || user.city.length < 2 || user.city.length > 255) {
        return "City must be between 2 and 255 characters.";
    }

    return null; 
}

module.exports = validateUser;
