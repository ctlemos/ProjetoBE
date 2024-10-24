const express = require("express");
const router = express.Router();
const joi = require("joi");
const pool = require("../models/connection");
const auth = require("../middleware/auth")
const {
    getAllOrders,
    getOrderById,
    insertOrder,
    getProductPrice,
    insertOrderDetails,
    updateOrder,
    deleteOrderDetails,
    deleteOrder
} = require("../models/order");

const validateOrder = joi.object({
    products: joi.array().items(
        joi.object({
            productId: joi.number().integer().required(),
            quantity: joi.number().integer().min(1).required()
        })
    )
});

//mostrar todas as encomendas
router.get("/", auth, async (request, response) => {
    try {
        const [orders] = await getAllOrders();
        return response.send(orders);
    } catch (err) {
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

//mostrar encomendas por ID
router.get("/:id", auth, async (request, response) => {
    try {
        const [order] = await getOrderById(request.params.id);

        if (order.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }
        return response.send(order[0]);
    } catch (err) {
        return response.status(400).send({ "message": "Bad Request" });
    }
});

//criar nova encomenda
router.post("/", auth, async (request, response) => {
    const order = request.body;

    try {
        await validateOrder.validateAsync(order);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    order.user = request.payload;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // inserir encomenda
        const orderId = await insertOrder(order.user.user_id);

        // inserir detalhes da encomenda
        for (const product of order.products) {
            const [productData] = await getProductPrice(product.productId);

            if (productData.length > 0) {
                const priceEach = productData[0].price;
                await insertOrderDetails(orderId, product.productId, product.quantity, priceEach);
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

//editar ume encomenda por ID
router.put("/:id", auth, async (request, response) => {
    const order = request.body;

    // validar pedido
    try {
        await validateOrder.validateAsync(order);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    order.user = request.payload;

    try { //procurar pela encomenda
        const [existingOrder] = await getOrderById(request.params.id);
        if (existingOrder.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }

        if(existingOrder.user_id != request.payload.user_id && !request.payload.isAdmin){
            return response.status(403).send({"message":"You do not have access to this action"});
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // atualizar encomenda
        await updateOrder(order.user.user_id, request.params.id);

        // apagar produtos antigos e inserir novos
        await deleteOrderDetails(request.params.id);
        for (const product of order.products) {
            const [productData] = await getProductPrice(product.productId);
            if (productData.length > 0) {
                const priceEach = productData[0].price;
                await insertOrderDetails(request.params.id, product.productId, product.quantity, priceEach);
            }
        }

        await connection.commit();
        connection.release();

        return response.status(202).send({ id: request.params.id, ...order });
    } catch (err) {
        console.log(err);
        return response.status(400).send({ "message": "Bad Request" });
    }
});

//apagar encomenda por ID
router.delete("/:id", auth, async (request, response) => {
    try {
        const [existingOrder] = await getOrderById(request.params.id);

        if (existingOrder.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }

        await deleteOrder(request.params.id);
        await deleteOrderDetails(request.params.id);

        return response.status(202).send({ "message": "Deleted successfully" });
    } catch (err) {
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

module.exports = router;