const pool = require('./connection');

// mostrar todas as encomendas
async function getAllOrders() {
    return pool.query('SELECT order_id, user_id AS userId, order_date AS orderDate FROM orders');
}

// encontrar encomenda por ID
async function getOrderById(orderId) {
    return pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
}

// crirar nova encomenda
async function insertOrder(userId) {
    const [orderResult] = await pool.execute('INSERT INTO orders (user_id) VALUES (?)', [userId]);
    return orderResult.insertId;
}

// procurar preço do produto por ID
async function getProductPrice(productId) {
    return pool.execute('SELECT price FROM products WHERE product_id = ?', [productId]);
}

//inserir detalhes da encomenda 
async function insertOrderDetails(orderId, productId, quantity, priceEach) {
    return pool.execute(
        'INSERT INTO order_details (order_id, product_id, quantity, price_each) VALUES (?, ?, ?, ?)',
        [orderId, productId, quantity, priceEach]
    );
}

// modificar uma encomenda
async function updateOrder(userId, orderId) {
    return pool.execute('UPDATE orders SET user_id = ? WHERE order_id = ?', [userId, orderId]);
}

// apagar detalhes da encomenda
async function deleteOrderDetails(orderId) {
    return pool.execute('DELETE FROM order_details WHERE order_id = ?', [orderId]);
}

// apagar encomenda
async function deleteOrder(orderId) {
    return pool.execute('DELETE FROM orders WHERE order_id = ?', [orderId]);
}

module.exports = {
    getAllOrders,
    getOrderById,
    insertOrder,
    getProductPrice,
    insertOrderDetails,
    updateOrder,
    deleteOrderDetails,
    deleteOrder
};