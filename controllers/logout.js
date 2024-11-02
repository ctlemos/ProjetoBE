const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware para autenticar o JWT token
const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return response.status(401).send({ "message": "No token provided" });

    const secretKey = process.env.JWT_SECRET_KEY;
    jwt.verify(token, secretKey, (err, user) => {
        if (err) return response.status(403).send({ "message": "Invalid token" });
        request.user = user;
        next();
    });
};

router.post("/", authenticateToken, (request, response) => {
    // Limpar o token do client side remover o token do local storage)
    return response.status(200).send({ "message": "User logged out successfully" });
});

module.exports = router;
