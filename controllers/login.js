const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("../models/user"); 
const express = require("express");
const router = express.Router();

// ValidationSchema para credenciais de login
const validateUser = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).max(1000).required()
});

// Rota de login
router.post("/", async (request, response) => {
    const login = request.body;

    // Validar dados do login
    try {
        await validateUser.validateAsync(login);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // Encontrar user por email
    const user = await findUserByEmail(login.email);

    // Retornar erro quando não encontrado
    if (!user) {
         return response.status(400).send({ "message": "Incorrect Credentials" });
    }

    // Verificar se a password corresponde à hashed password guardada na database
    const success = await bcrypt.compare(login.password, user.password);
    if (!success) {
        return response.status(400).send({ "message": "Incorrect Credentials" });
    }

    // Se estiver tudo correto gerar JWT token 
    const payload = {
        "user_id": user.user_id, 
        "email": user.email,
        "is_admin": user.is_admin
    };

    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        return response.status(500).send({ "message": "Server error: Missing secret key" });
    }

    jwt.sign(payload, secretKey, (err, token) => {
        if (err || !token) {
            return response.status(500).send({ "message": "Error generating token" });
        }

        // Enviar token se estiver tudo correto
        return response
            .header({ "Authorization": "Bearer " + token })
            .send({
                "Authorization": "Bearer " + token,
                "token": token
            });
    });
});

module.exports = router;