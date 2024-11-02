const pool = require('./connection'); // MySQL connection pool

// Ver todos os produtos
async function getAllProducts() {
    const [rows] = await pool.query('SELECT product_id, name, price FROM products');
    return rows;
}

// Econtrar produto por ID
async function getProductById(productId) {
    const [rows] = await pool.query('SELECT product_id, name, price FROM products WHERE product_id = ?', [productId]);
    return rows[0]; // Retorna o primeiro produto encontrado ou indefinido
}

async function getProductsFromCategorie(categorie_id){
    const [rows] = await pool.query('SELECT product_id, name, price FROM products WHERE categorie_id = ?', [categorie_id]);
    return rows;
};

// Criar novo produto
async function createProduct(product) {
    const query = 'INSERT INTO products (name, price) VALUES (?, ?)';
    const [result] = await pool.query(query, [product.name, product.price]);
    return result.insertId; // Retorna novo produto + id
}

// Alterar um produto
async function updateProduct(categorie_id, product) {
    const query = 'UPDATE products SET name = ?, price = ? WHERE product_id = ?';
    const [result] = await pool.query(query, [product.name, product.price, categorie_id]);
    return result.affectedRows; // Retorna o numero de colunas mudadas
}

// Apagar um produto
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