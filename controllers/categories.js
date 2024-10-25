const express = require("express");
const joi = require("joi");
const auth = require("../middleware/auth");
const {
    getAllCategories,
    getCategorieById,
    createCategorie,
    updateCategorie,
    deleteCategorie
} = require("../models/categorie");

const router = express.Router();

// Validation schema para as categorias
const validateCategorie = joi.object({
    name: joi.string().required().min(1).max(255)
        .messages({
            'string.base': 'Name must be a string.',
            'string.empty': 'Name must not be empty.',
            'string.min': 'Name must be at least 1 character long.',
            'string.max': 'Name must be less than 255 characters long.',
            'any.required': 'Name is required.',
        }),
    parent_id: joi.number().integer().positive().max(4294967295).optional()
        .messages({
            'number.base': 'Parent ID must be a number.',
            'number.integer': 'Parent ID must be an integer.',
            'number.positive': 'Parent ID must be a positive number.',
            'number.max': 'Parent ID exceeds the allowed limit.',
        })
});

// ver todos as categorias
router.get("/", async (request, response) => {
    try {
        const categories = await getAllCategories();
        return response.status(200).json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err.message);
        return response.status(404).send({"message":"Not Found"});
    }
});

// mostrar uma categoria por ID
router.get("/:id", async (request, response) => {
    try {
        const categorie = await getCategorieById(request.params.id);

        if (!categorie) {
            return response.status(404).send({ "message": "Categorie not found" });
        }

        return response.status(200).send(categorie);
    } catch (err) {
        console.error("Error fetching categorie by ID:", err.message);
        return response.status(400).send({ "message": "Bad Request" });
    }
});

// criar uma nova categoria
router.post("/", auth, async (request, response) => {
    
    //só o admin é que pode criar categorias
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    const newCategorie = request.body;

    try {
        await validateCategorie.validateAsync(newCategorie);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // criar categoria
    try {
        const categorie_id = await createCategorie(newCategorie);
        return response.status(201).send({ id: categorie_id, ...newCategorie });
    } catch (err) {
        console.error("Error creating categorie:", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

// atualizar uma categoria por ID
router.put("/:id", auth, async (request, response) => {

    //só o admin é que pode alterar uma categoria
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    const updatedCategorie = request.body;

    // validar os novos detalhes
    try {
        await validateCategorie.validateAsync(updatedCategorie);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // atualizar categoria
    try {
        const affectedRows = await updateCategorie(request.params.id, updatedCategorie);
        if (affectedRows === 0) {
            return response.status(404).send({ "message": "Categorie not found" });
        }
        return response.status(200).send({ id: request.params.id, ...updatedCategorie });
    } catch (err) {
        console.error("Error updating categorie:", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

// apagar uma categoria por ID
router.delete("/:id", auth, async (request, response) => {

    //só o amdin é que pode apagar uma categoria
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    try {
        const affectedRows = await deleteCategorie(request.params.id);
        if (affectedRows === 0) {
            return response.status(404).send({ "message": "Categorie not found" });
        }
        return response.status(200).send({ "message": "Categorie deleted successfully" });

    } catch (err) {
        console.error("Error deleting categorie:", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

module.exports = router;