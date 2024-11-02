const pool = require('./connection'); // MySQL connection pool

// Ver todos as catgeorias
async function getAllCategories() {
    const [rows] = await pool.query('SELECT categorie_id, name FROM categories WHERE parent_id is NOT NULL'); //sub categorias
    return rows;
}

// Econtrar categoria por ID
async function getCategorieById(categorie_id) {
    const [rows] = await pool.query('SELECT name, description FROM categories WHERE categorie_id = ?', [categorie_id]);
    return rows[0]; // retorna a primeira categoria encontrado ou indefinido
}

// Criar nova categoria
async function createCategorie(categorie) {
    const query = 'INSERT INTO categories (name, parent_id, description) VALUES (?, ?, ?)';
    const [result] = await pool.query(query, [categorie.name, categorie.parent_id, categorie.description]);
    return result.insertId; // Retorna nova categoria + id
}

// Alterar uma categoria
async function updateCategorie(id, categorie) {
    const query = 'UPDATE categories SET name = ?, parent_id = ?, description = ? WHERE categorie_id = ?';
    const [result] = await pool.query(query, [categorie.name, categorie.parent_id, categorie.description, id]);
    return result.affectedRows; // Retorna o numero de colunas mudadas
}

// Apagar uma categoria
async function deleteCategorie(categorie_id) {
    const query = 'DELETE FROM categories WHERE categorie_id = ?';
    const [result] = await pool.query(query, [categorie_id]);
    return result.affectedRows; 
}

module.exports = {
    getAllCategories,
    getCategorieById,
    createCategorie,
    updateCategorie,
    deleteCategorie
};