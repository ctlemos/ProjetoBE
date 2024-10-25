const pool = require('./connection'); // MySQL connection pool

//ver todos os produtos
async function getAllProducts() {
    const [rows] = await pool.query('SELECT product_id, name, price FROM products');
    return rows;
}

//econtrar produto por ID
async function getProductById(categorie_id) {
    const [rows] = await pool.query('SELECT product_id, name, price FROM products WHERE product_id = ?', [categorie_id]);
    return rows[0]; // retorna o primeiro produto encontrado ou indefinido
}

async function getProductsFromCategorie(categorie_id){
    const [rows] = await pool.query('SELECT product_id, name, price FROM products WHERE categorie_id = ?', [categorie_id]);
    return rows;
};

//criar novo produto
async function createProduct(product) {
    const query = 'INSERT INTO products (name, price) VALUES (?, ?)';
    const [result] = await pool.query(query, [product.name, product.price]);
    return result.insertId; // retorna novo produto + id
}

//alterar um produto
async function updateProduct(categorie_id, product) {
    const query = 'UPDATE products SET name = ?, price = ? WHERE product_id = ?';
    const [result] = await pool.query(query, [product.name, product.price, categorie_id]);
    return result.affectedRows; // retorna o numero de colunas mudadas
}

//apagar um produto
async function deleteProduct(id) {
    const query = 'DELETE FROM products WHERE product_id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows; 
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductsFromCategorie,
    createProduct,
    updateProduct,
    deleteProduct
};