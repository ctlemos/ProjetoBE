const express = require("express");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const joi = require("joi");
const auth = require("../middleware/auth");
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../models/product");

const router = express.Router();

// configurar multer para guardar temporariament o ficheiro
const upload = multer({ dest: 'temp/' });

// Validation schema para os produtos
const validateProduct = joi.object({
    name: joi.string().required().min(1).max(255),
    price: joi.number().min(1).max(9999).required()
});

// Ver todos os produtos
router.get("/", async (request, response) => {
    try {
        const products = await getAllProducts();
        return response.status(200).json(products);
    } catch (err) {
        console.error("Error fetching products:", err.message);
        return response.status(404).send({"message":"Not Found"});
    }
});

// Mostrar um produto em especifico por ID
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

// Criar um novo produto
router.post("/", auth, upload.single('image'), async (request, response) => {
    
    // Só o admin é que pode criar produtos
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    const newProduct = request.body;

    // Validar detalhes do produto
    try {
        await validateProduct.validateAsync(newProduct);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // Varificar se foi feito o upload de uma imagem 
    if (!request.file) {
        return response.status(400).send({ "message": "Image file is required" });
    }

    // Criar produto
    try {
        // Ler o ficheiro de imagem e converter para Base64
        const imageData = fs.readFileSync(request.file.path).toString('base64');
        // Incluir a imagem Base64 data no objecto de produto
        newProduct.image = imageData;

        const productId = await createProduct(newProduct);

        // Apagar o ficheiro temporário depois da conversão
        fs.unlinkSync(request.file.path);

        return response.status(201).send({ id: productId, ...newProduct });
    } catch (err) {
        console.error("Error creating product:", err.message);

        // Apagar o temp file se houver um erro
        if (fs.existsSync(request.file.path)) {
            fs.unlinkSync(request.file.path);
        }

        return response.status(400).send({"message":"Bad Request"});
    }
});

// Atualizar um produto por ID
router.put("/:id", auth, async (request, response) => {

    // Só o admin é que pode alterar um produto
    if (!request.payload.is_admin) {
        return response.status(403).send({ "message": "Forbidden: You do not have access to this action" });
    }

    const updatedProduct = request.body;

    // Validar os novos detalhes
    try {
        await validateProduct.validateAsync(updatedProduct);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    // Atualizar produto
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

// Apagar um produto por ID
router.delete("/:id", auth, async (request, response) => {

    // Só o amdin é que pode apagar um produto
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