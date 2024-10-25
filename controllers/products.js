const express = require("express");
const joi = require("joi");
const auth = require("../middleware/auth");
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../models/Product");

const router = express.Router();

// Validation schema para os produtos
const validateProduct = joi.object({
    name: joi.string().required().min(1).max(255),
    price: joi.number().min(1).max(9999).required()
});

// ver todos os produtos
router.get("/", async (request, response) => {
    try {
        const products = await getAllProducts();
        return response.status(200).json(products);
    } catch (err) {
        console.error("Error fetching products:", err.message);
        return response.status(404).send({"message":"Not Found"});
    }
});

// mostrar um produto em especifico por ID
router.get("/:id", async (request, response) => {
    try {
        const product = await getProductById(request.params.id);

        if (!product) {
            return response.status(404).send({ "message": "Product not found" });
        }

        return response.status(200).send(product);
    } catch (err) {
        console.error("Error fetching product by ID:", err.message);
        return response.status(400).send({ "message": "Bad Request" });
    }
});

// criar um novo produto
router.post("/", auth, async (request, response) => {
    
    //só o admin é que pode criar produtos
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    const newProduct = request.body;

    // validar detalhes do produto
    try {
        await validateProduct.validateAsync(newProduct);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // criar produto
    try {
        const productId = await createProduct(newProduct);
        return response.status(201).send({ id: productId, ...newProduct });
    } catch (err) {
        console.error("Error creating product:", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

// atualizar um produto por ID
router.put("/:id", auth, async (request, response) => {

    //só o admin é que pode alterar um produto
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    const updatedProduct = request.body;

    // validar os novos detalhes
    try {
        await validateProduct.validateAsync(updatedProduct);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // atualizar produto
    try {
        const affectedRows = await updateProduct(request.params.id, updatedProduct);
        if (affectedRows === 0) {
            return response.status(404).send({ "message": "Product not found" });
        }
        return response.status(200).send({ id: request.params.id, ...updatedProduct });
    } catch (err) {
        console.error("Error updating product:", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

// apagar um produto por ID
router.delete("/:id", auth, async (request, response) => {

    //só o amdin é que pode apagar um produto
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    try {
        const affectedRows = await deleteProduct(request.params.id);
        if (affectedRows === 0) {
            return response.status(404).send({ "message": "Product not found" });
        }
        return response.status(200).send({ "message": "Product deleted successfully" });

    } catch (err) {
        console.error("Error deleting product:", err.message);
        return response.status(400).send({"message":"Bad Request"});
    }
});

module.exports = router;