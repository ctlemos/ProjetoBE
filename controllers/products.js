const express = require("express");
const pool = require("../models/connection");
const validateProduct = require("../models/product");
const router = express.Router(); 


router.get("/", async (request, response) => {
    try {
        const [rows] = await pool.query("SELECT name, price FROM products");
        return response.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching products:", err.message);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get("/:id", async (request, response) => {
    try {
        const query = "SELECT * FROM products WHERE product_id = ?";
        const [results] = await pool.query(query, [request.params.id]);

        if (results.length === 0) {
            return response.status(404).json({ message: "Product not found" });
        }
        return response.status(200).json(results[0]);
    } catch (err) {
        console.error("Error fetching product by ID:", err.message);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/", async (request, response) => {
    const newProduct = request.body;

    const error = validateProduct(newProduct);
    if (error) {
        return response.status(400).json({ message: error });
    }

    try {
        const query = "INSERT INTO products (name, price) VALUES (?, ?)";
        const [results] = await pool.query(query, [newProduct.name, newProduct.price]);
        newProduct.id = results.insertId;
        return response.status(201).json(newProduct);
    } catch (err) {
        console.error("Error creating product:", err.message);
        return response.status(400).send({"message": err.details[0].message});
    }
});

router.put("/:id", async (request, response) => {
    const updatedProduct = request.body;
    const productId = parseInt(request.params.id); 

    const error = validateProduct(updatedProduct);
    if (error) return response.status(400).json({ message: error });

    try {
        // verificar se existe 
        const [existingProduct] = await pool.query("SELECT * FROM products WHERE product_id = ?", [productId]);
        if (!existingProduct.length) return response.status(404).json({ message: "Product not found" });

        // verificar se existe mudança
        const { name, price } = updatedProduct;
        const currentProduct = existingProduct[0];
        if (name === currentProduct.name && price === currentProduct.price) {
            return response.status(400).json({ message: "No changes detected" });
        }

        // Update se existir mudança
        const [result] = await pool.query("UPDATE products SET name = ?, price = ? WHERE product_id = ?", [name, price, productId]);
        if (!result.affectedRows) return response.status(404).json({ message: "Product not found" });

        return response.status(200).json({ ...updatedProduct, id: productId });
    } catch (err) {
        console.error("Error updating product:", err.message);
        return response.status(400).send({"message": err.details[0].message});
    }
});

router.delete("/:id", async (request, response) => {
    try {
        const query = "DELETE FROM products WHERE product_id = ?";
        const [results] = await pool.query(query, [request.params.id]);

        if (results.affectedRows === 0) {
            return response.status(404).json({ message: "Product not found" });
        }
        return response.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err.message);
        return response.status(400).send({"message": err.details[0].message});
    }
});

module.exports = router;