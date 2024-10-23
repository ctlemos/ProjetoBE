const pool = require("../models/connection"); 

async function createOrder(userId, products) {
    const connection = await pool.getConnection();  

    try {
        await connection.beginTransaction();

        //inserir a encomenda na tabela de encomendas
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, order_date) VALUES (?, ?)', 
            [userId, new Date()]
        );
        const orderId = orderResult.insertId;

        //inserir os produtos na tabela de detalhes da encomenda
        for (const product of products) {
            await connection.execute(
                'INSERT INTO order_details (order_id, product_id, quantity, price_each) VALUES (?, ?, ?, ?)', 
                [orderId, product.productId, product.quantity, product.priceEach]
            );
        }

        await connection.commit();
        console.log("Order created successfully");
    } catch (error) {
        //voltar atrás se existir algum erro
        await connection.rollback();
        console.error("Error creating order, transaction rolled back:", error);
    } finally {
        connection.release();
    }
}




// procurar uma encomenda por ID
/* async function getOrderById(orderId) {
    try {
        // encontrar encomenda e produtos
        const [orderRows] = await pool.query(
            "SELECT o.id, o.order_date, oi.product_id, oi.quantity, oi.price_each FROM orders o " +
            "JOIN order_items oi ON o.id = oi.order_id WHERE o.id = ?", 
            [orderId]
        );

        if (orderRows.length === 0) {
            return null; 
        }

        const order = {
            id: orderRows[0].id,
            orderDate: orderRows[0].order_date,
            products: orderRows.map(row => ({
                productId: row.product_id,
                quantity: row.quantity,
                priceEach: row.price_each
            }))
        };

        return order;

    } catch (err) {
        console.error("Error fetching order:", err.message);
        throw new Error("Failed to fetch order");
    }
} */

module.exports =  createOrder;