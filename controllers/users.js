const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../models/connection");
const validateUser = require("../models/user");
const router = express.Router();

router.get("/", async (request, response) => {
    try {
        const [rows] = await pool.query("SELECT name, last_name, email FROM users");
        return response.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/:id", async (request, response) => {
    try {
        const query = "SELECT name, last_name, email FROM users WHERE user_id = ?";
        const [results] = await pool.query(query, [request.params.id]);

        if (results.lenght === 0) {
            return response.status(404).json({ message: "User Not Found" });
        }
        return response.status(200).json(results[0]);
    } catch (err) {
        console.error("Error fetching user by ID:", err.message);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/", async (request, response) => {
    
    const newUser = request.body;

    const error = validateUser(newUser);
    if (error) {
        return response.status(400).json({ message: error });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
        
        const query = "INSERT INTO users (name, last_name, password, nif, email, phone, address, postal_code, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const [results] = await pool.query(query, [newUser.name, newUser
            .last_name, newUser.password, newUser.nif, newUser.email, newUser.phone, newUser.address, newUser.postal_code, newUser.city
        ]);

        newUser.id = results.insertId;
        return response.status(201).json(newUser)

    } catch (err) {
        console.error("Error creating new user:", err.message);
        return response.status(400).send({"message": err.details[0].message});
    }
});

router.put("/:id", async (request, response) => {
    const updatedUser = request.body;
    const userId = parseInt(request.params.id);

    const error = validateUser(updatedUser);
    if (error) return response.status(400).json({ message: error });

    try {
        // validar se o user existe
        const [existingUser] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
        if (!existingUser.length) return response.status(404).json({ message: "User Not Found" });

        // destruturar os detalhes atualizados do utilizados
        const { name, last_name, password, nif, email, phone, address, postal_code, city } = updatedUser;
        const currentUser = existingUser[0];

        // verificar se algum campo mudou excepto a pass
        const isUnchanged = [name, last_name, nif, email, phone, address, postal_code, city]
            .every((field, index) => field === Object.values(currentUser)[index + 1]);

        // se nao existir mudanças, excepto a pass
        if (isUnchanged && !password) {
            return response.status(400).json({ message: "No changes detected" });
        }

        // Hash na pass se colocar nova, se não manter a antiga hashed pass
        let hashedPassword = currentUser.password;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update se existir mudanças
        const [result] = await pool.query(
            "UPDATE users SET name = ?, last_name = ?, password = ?, nif = ?, email = ?, phone = ?, address = ?, postal_code = ?, city = ? WHERE user_id = ?", 
            [name, last_name, hashedPassword, nif, email, phone, address, postal_code, city, userId]
        );

        if (!result.affectedRows) return response.status(404).json({ message: "User not found" });

        return response.status(200).json({ ...updatedUser, id: userId });
    } catch (err) {
        console.error("Error updating user:", err.message);
        return response.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/:id", async (request, response) => {
    try {
        const query = "DELETE FROM users WHERE user_id = ?";
        const [results] = await pool.query(query, [request.params.id]);

        if (results.affectedRows === 0) {
            return response.status(404).json({ message: "User not found" });
        }
        return response.status(200).json({ message: "User deleted successfully "});
    } catch (err) {
        console.error("Error deleting user", err.message);
        return response.status(400).send({"message": err.details[0].message});
    }
});

module.exports = router;