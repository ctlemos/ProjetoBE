const express = require("express");
const joi = require('joi');
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../models/user");

const router = express.Router();

// ValidationSchema de criação de novo user
const validateUser = (user) => {
    const schema = joi.object({
        name: joi.string().min(3).max(255).required().messages({
            'string.base': 'Name must be a string.',
            'string.empty': 'Name must not be empty.',
            'string.min': 'Name must be at least 3 characters long.',
            'string.max': 'Name must be less than 255 characters long.',
            'any.required': 'Name is required.',
        }),
        last_name: joi.string().min(3).max(255).required().messages({
            'string.base': 'Last Name must be a string.',
            'string.empty': 'Last Name must not be empty.',
            'string.min': 'Last Name must be at least 3 characters long.',
            'string.max': 'Last Name must be less than 255 characters long.',
            'any.required': 'Last Name is required.',
        }),
        password: joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required().messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one letter and one number.',
            'string.empty': 'Password must not be empty.',
            'any.required': 'Password is required.',
        }),
        nif: joi.string().pattern(/^\d{9}$/).required().messages({
            'string.pattern.base': 'NIF must be a valid 9-digit number.',
            'string.empty': 'NIF must not be empty.',
            'any.required': 'NIF is required.',
        }),
        email: joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address.',
            'string.empty': 'Email must not be empty.',
            'any.required': 'Email is required.',
        }),
        phone: joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
            'string.pattern.base': 'Phone number must be a valid international or local phone number.',
            'string.empty': 'Phone number must not be empty.',
            'any.required': 'Phone number is required.',
        }),
        address: joi.string().max(255).required().messages({
            'string.max': 'Address must be less than 255 characters long.',
            'string.empty': 'Address must not be empty.',
            'any.required': 'Address is required.',
        }),
        postal_code: joi.string().pattern(/^\d{4}-\d{3}$/).required().messages({
            'string.pattern.base': 'Postal code must be in the format xxxx-xxx (8 digits with a hyphen).',
            'string.empty': 'Postal code must not be empty.',
            'any.required': 'Postal code is required.',
        }),
        city: joi.string().min(2).max(40).required().messages({
            'string.min': 'City must be at least 2 characters long.',
            'string.max': 'City must be less than 255 characters long.',
            'string.empty': 'City must not be empty.',
            'any.required': 'City is required.',
        })
    });
    return schema.validate(user);
};
// Validationschema para atualizar o user
const validateUserUpdate = (userUpdated) => {
    const schema = joi.object({
        name: joi.string().min(3).max(255).messages({
            'string.base': 'Name must be a string.',
            'string.min': 'Name must be at least 3 characters long.',
            'string.max': 'Name must be less than 255 characters long.',
        }),
        last_name: joi.string().min(3).max(255).messages({
            'string.base': 'Last Name must be a string.',
            'string.min': 'Last Name must be at least 3 characters long.',
            'string.max': 'Last Name must be less than 255 characters long.',
        }),
        password: joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).messages({
            'string.pattern.base': 'Password must be at least 8 characters long and contain at least one letter and one number.',
        }),
        nif: joi.string().pattern(/^\d{9}$/).messages({
            'string.pattern.base': 'NIF must be a valid 9-digit number.',
        }),
        email: joi.string().email().messages({
            'string.email': 'Email must be a valid email address.',
        }),
        phone: joi.string().pattern(/^\+?[1-9]\d{1,14}$/).messages({
            'string.pattern.base': 'Phone number must be a valid international or local phone number.',
        }),
        address: joi.string().max(255).messages({
            'string.max': 'Address must be less than 255 characters long.',
        }),
        postal_code: joi.string().pattern(/^\d{4}-\d{3}$/).messages({
            'string.pattern.base': 'Postal code must be in the format xxxx-xxx (8 digits with a hyphen).',
        }),
        city: joi.string().min(2).max(40).messages({
            'string.min': 'City must be at least 2 characters long.',
            'string.max': 'City must be less than 40 characters long.',
        })
    });
    return schema.validate(userUpdated);
};

// Mostrar todos os users
router.get("/", auth, async (request, response) => {
    // Só o admin é que pode ver todos os users
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    try {
        const [users] = await getAllUsers();
        return response.status(200).send(users);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        return response.status(400).send({ error: 'Bad Request' });
    }
});

// Mostrar user por ID
router.get("/:id", auth, async (request, response) => {
    try {
        const user = await getUserById(request.params.id);
        if (user.length === 0) {
            return response.status(404).send({ message: "User Not Found" });
        }

        // Só o user autenticado e o admin é que ver os dados
        if (user[0].user_id != request.payload.user_id && !request.payload.is_admin) {
            return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
        }

        // Render o `user.ejs` template, passando o user data
        response.render("user.ejs", { user: user[0] });

    } catch (err) {
        console.error("Error fetching user by ID:", err.message);
        return response.status(500).send({ error: 'Internal Server Error' });
    }
});

// Criar novo user
router.post("/", async (request, response) => {
    const newUser = request.body;
    const { error } = validateUser(newUser);

    if (error) {
        return response.status(400).send({ message: error.details[0].message });
    }

    try {
        // Hashing da password / encriptação
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        const userId = await createUser(newUser);
        newUser.id = userId;

        return response.status(201).send(newUser);
    } catch (err) {
        console.error("Error creating new user:", err.message);
        return response.status(500).send({ message: "Internal Server Error" });
    }
});

// Editar user por ID
router.put("/:id", auth, async (request, response) => {
    const updatedUser = request.body;
    
    const { error } = validateUserUpdate(updatedUser);

    if (error) return response.status(400).send({ message: error.details[0].message });

    try {
        const existingUser = await getUserById(request.params.id);
        if (existingUser.length === 0) {
            return response.status(404).send({ message: "User Not Found" });
        }

        // Só o user autenticado e o admin é que podem modificar os dados
        if (existingUser[0].user_id != request.payload.user_id && !request.payload.is_admin) {
            return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
        }

        // Atualizar password se fornecida
        if (updatedUser.password) {
            const salt = await bcrypt.genSalt(10);
            updatedUser.password = await bcrypt.hash(updatedUser.password, salt);
        } else {
            // Remover password do updatedUser para evitar overwriting 
            delete updatedUser.password;
        }

        await updateUser(request.params.id, updatedUser);

        // Excluir password da response
        const responseData = { ...updatedUser, id: request.params.id };
        delete responseData.password;

        return response.status(200).send({
            message: "User updated successfully",
            user: responseData
        });
    } catch (err) {
        console.error("Error updating user:", err.message);
        return response.status(500).send({ message: "Internal Server Error" });
    }
});

// Apagar user por ID
router.delete("/:id", auth, async (request, response) => {
    try {
        // Verificar se o user existe e se tem autenticação
        const existingUser = await getUserById(request.params.id);
        if (existingUser.length === 0) {
            return response.status(404).send({ message: "User not found" });
        }

        // Só o user autenticado e o admin é que apagar os dados
        if (existingUser[0].user_id != request.payload.user_id && !request.payload.is_admin) {
            return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
        }

        // Se tiver autenticação apagar
        const [result] = await deleteUser(request.params.id);
        if (result.affectedRows === 0) {
            return response.status(404).send({ message: "User not found" });
        }

        return response.status(200).send({ message: "User deleted successfully" });

    } catch (err) {
        console.error("Error deleting user", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

module.exports = router;