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
        // só o admin é que pode ver todas as encomendas
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

//mostrar encomendas por ID
router.get("/:id", auth, async (request, response) => {
    try {
        const [order] = await getOrderById(request.params.id);

        if (order.length === 0) {
            return response.status(404).send({ "message": "Not Found" });
        }
        
        //so um user que fez a encomenda e o admin é que podem ver a encomenda
        if(order[0].user_id != request.payload.user_id && !request.payload.is_admin){
            return response.status(403).send({"message":"You do not have access to this action"});
        }


        return response.send(order[0]);
    } catch (err) {
        return response.status(400).send({ "message": "Bad Request" });
    }
});

// criar nova encomenda
router.post("/checkout", auth, async (request, response) => {
    const order = request.body;

    order.user = request.payload;

    try {
        await validateOrder.validateAsync(order);
    } catch (err) {
        return response.status(400).send({ "message": err.details[0].message });
    }

    
    let totalOrderPrice = 0;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // calcular o total da encomenda e vald¡idar o preço dos produtos
        for (const product of order.products) {
            const [productData] = await getProductPrice(product.productId);

            if (productData.length > 0) {
                const priceEach = productData[0].price;
                totalOrderPrice += priceEach * product.quantity; // calcular o total por produto
            } else {
                throw new Error(`Product with ID ${product.productId} not found`);
            }
        }

        // inserir encomenda na `order` table com o preçpo total
        const orderId = await insertOrder(order.user.user_id, totalOrderPrice);

        // inserir cada produto na `order_details` table
        for (const product of order.products) {
            const [productData] = await getProductPrice(product.productId);

            if (productData.length > 0) {
                const priceEach = productData[0].price;
                await insertOrderDetails(orderId, product.productId, product.quantity, priceEach);
            }
        }

        // iniciar transação
        await connection.commit();
        connection.release();

        return response.status(202).send({ id: orderId, ...order, totalPrice: totalOrderPrice });

    } catch (err) {
        if (connection) await connection.rollback();
        if (connection) connection.release();

        console.error("Error processing order:", err.message);
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

        //so um user que criou a encomenda e o admin é que podem alterar a encomenda
        if(existingOrder[0].user_id != request.payload.user_id && !request.payload.is_admin){
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

        //so um user autenticado e o admin é que podem apagar a encomenda
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