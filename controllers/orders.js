const express = require("express");
const router = express.Router();
const joi = require("joi");
const pool = require("../models/connection"); 

const validationSchema = joi.object({
    userId: joi.number().integer().required(), 
    products: joi.array().items(
        joi.object({
            productId: joi.number().integer().required(),
            quantity: joi.number().integer().min(1).required()
        })
    )
});

router.get("/", async (request, response) => {
    try {
        const [orders] = await pool.query('SELECT order_id, user_id AS userId, order_date AS orderDate FROM orders');
        return response.send(orders);
    } catch (err) {
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

router.get("/:id", async (request, response) => {
    try {
        const [order] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [request.params.id]);

        if (order.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }
        return response.send(order[0]);
    } catch (err) {
        return response.status(400).send({ "message": "Bad Request" });
    }
});

router.post("/", async (request, response) => {
    const order = request.body;

    try {
        await validationSchema.validateAsync(order);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, order_date) VALUES (?, ?)', 
            [order.userId, new Date()]
        );
        const orderId = orderResult.insertId;

        for (let index = 0; index < order.products.length; index++) {
            const product = order.products[index];

            const [productData] = await connection.execute('SELECT price FROM products WHERE product_id = ?', [product.productId]);

            if (productData.length > 0) {
                const priceEach = productData[0].price;
                await connection.execute(
                    'INSERT INTO order_details (order_id, product_id, quantity, price_each) VALUES (?, ?, ?, ?)', 
                    [orderId, product.productId, product.quantity, priceEach]
                );
            }
        }

        await connection.commit();
        connection.release();

        return response.status(202).send({ id: orderId, ...order });
    } catch (err) {
        console.error(err);
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

router.put("/:id", async (request, response) => {
    const order = request.body;

    try {
        await validationSchema.validateAsync(order);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    try {
        const [existingOrder] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [request.params.id]);
        if (existingOrder.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        await connection.execute('UPDATE orders SET user_id = ? WHERE order_id = ?', [order.userId, request.params.id]);

        await connection.execute('DELETE FROM order_details WHERE order_id = ?', [request.params.id]);

        for (let index = 0; index < order.products.length; index++) {
            const product = order.products[index];

            const [productData] = await connection.execute('SELECT price FROM products WHERE product_id = ?', [product.productId]);

            if (productData.length > 0) {
                const priceEach = productData[0].price;
                await connection.execute(
                    'INSERT INTO order_details (order_id, product_id, quantity, price_each) VALUES (?, ?, ?, ?)',
                    [request.params.id, product.productId, product.quantity, priceEach]
                );
            }
        }

        await connection.commit();
        connection.release(); 

        return response.status(202).send({ id: request.params.id, ...order });
    } catch (err) {
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

router.delete("/:id", async (request, response) => {
    try {
        const [existingOrder] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [request.params.id]);

        if (existingOrder.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }

        await pool.query('DELETE FROM orders WHERE order_id = ?', [request.params.id]);
        await pool.query('DELETE FROM order_details WHERE order_id = ?', [request.params.id]);

        return response.status(202).send({ "message": "Deleted successfully" });
    } catch (err) {
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

module.exports = router;
