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

// Mostrar todas as encomendas
router.get("/", auth, async (request, response) => {
    try {
        // Só o admin é que pode ver todas as encomendas
        if (!request.payload.is_admin) {
            return response.status(403).send({ "message": "You do not have access to this action" });
        }

        const [orders] = await getAllOrders();
        return response.send(orders);

    } catch (err) {
        console.error("Error fetching orders:", err.message);
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

// Mostrar encomenda por ID
router.get("/:id", auth, async (request, response) => {
    try {
        const [order] = await getOrderById(request.params.id);

        if (order.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }
        
        // Só um user que fez a encomenda e o admin é que podem ver a encomenda
        if(order[0].user_id != request.payload.user_id && !request.payload.is_admin){
            return response.status(403).send({"message":"You do not have access to this action"});
        }


        return response.send(order[0]);
    } catch (err) {
        return response.status(400).send({ "message": "Bad Request" });
    }
});

// Criar nova encomenda 
router.post("/", auth, async (request, response) => {
    const order = request.body;

    try {
        await validateOrder.validateAsync(order);
    } catch (err) {
        console.error("Validation error:", err);
        return response.status(400).send({ "message": err.details[0].message });
    }

    order.user = request.payload;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        let totalPrice = 0;
        
        for (const product of order.products) {
            try {
                // Debugging
                // console.log("Processing product:", product);

                const [productData] = await getProductPrice(product.productId);

                // Certeficar de que os dados estão corretos
                if (!productData || productData.length === 0) {
                    console.error(`Product ID ${product.productId} not found in database.`);
                    return response.status(400).send({ "message": `Product ID ${product.productId} not found.` });
                }

                // Calcular o preço do produto
                const priceEach = productData[0].price;
                const totalProductPrice = priceEach * product.quantity;
                totalPrice += totalProductPrice;

                // Debugging
                // console.log(`Product ID: ${product.productId}, Unit Price: ${priceEach}, Quantity: ${product.quantity}, Total Product Price: ${totalProductPrice}`);

            } catch (error) {
                console.error("Error fetching product price:", error);
                return response.status(500).send({ "message": "Error fetching product price" });
            }
        }

        // Mostrar o preço final 
        console.log("Calculated Total Price for Order:", totalPrice);
        order.totalPrice = totalPrice;

        // Inserir encomenda com o preço final
        const orderId = await insertOrder(order.user.user_id, order.totalPrice);

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
        console.error("Error processing order:", err);
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

// Editar ume encomenda por ID
router.put("/:id", auth, async (request, response) => {
    const order = request.body;

    // Validar pedido
    try {
        await validateOrder.validateAsync(order);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    order.user = request.payload;

    try { 
        // Procurar pela encomenda
        const [existingOrder] = await getOrderById(request.params.id);
        if (existingOrder.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }

        // Só um user que criou a encomenda e o admin é que podem alterar a encomenda
        if(existingOrder[0].user_id != request.payload.user_id && !request.payload.is_admin){
            return response.status(403).send({"message":"You do not have access to this action"});
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // Atualizar encomenda
        await updateOrder(order.user.user_id, request.params.id);

        // Apagar produtos antigos e inserir novos
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

// Apagar encomenda por ID
router.delete("/:id", auth, async (request, response) => {
    try {
        const [existingOrder] = await getOrderById(request.params.id);

        if (existingOrder.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }

        // Só um user autenticado e o admin é que podem apagar a encomenda
        if(existingOrder[0].user_id != request.payload.user_id && !request.payload.is_admin){
            return response.status(403).send({"message":"You do not have access to this action"});
        }

        await deleteOrder(request.params.id);
        await deleteOrderDetails(request.params.id);

        return response.status(202).send({ "message": "Deleted successfully" });
    } catch (err) {
        return response.status(500).send({ "message": "Internal Server Error" });
    }
});

module.exports = router;