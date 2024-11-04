const pool = require('./connection');

// Mostrar todos os users
async function getAllUsers() {
    return pool.query("SELECT name, last_name, email FROM users");
}

// Procurar user por ID
async function getUserById(userId) {
    const [rows] = await pool.query("SELECT user_id, name, last_name, email FROM users WHERE user_id = ?", [userId]);
    return rows; 
}

// Procurar user por email
async function findUserByEmail(email) {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];  // Mostrar o primeiro user encontrado ou not found
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
    }
}

// Criar novo user
async function createUser(newUser) {
    const query = "INSERT INTO users (name, last_name, password, nif, email, phone, address, postal_code, city, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const [results] = await pool.query(query, [
        newUser.name,
        newUser.last_name,
        newUser.password,
        newUser.nif,
        newUser.email,
        newUser.phone,
        newUser.address,
        newUser.postal_code,
        newUser.city,
        newUser.is_admin
    ]);
    return results.insertId;
}

// Editar user
async function updateUser(userId, updatedUser) {
    const query = "UPDATE users SET name = ?, last_name = ?, password = ?, nif = ?, email = ?, phone = ?, address = ?, postal_code = ?, city = ? WHERE user_id = ?";
    return pool.query(query, [
        updatedUser.name,
        updatedUser.last_name,
        updatedUser.password,
        updatedUser.nif,
        updatedUser.email,
        updatedUser.phone,
        updatedUser.address,
        updatedUser.postal_code,
        updatedUser.city,
        userId
    ]);
}

// Apagar user por ID
async function deleteUser(userId) {
    return pool.query("DELETE FROM users WHERE user_id = ?", [userId]);
}

module.exports = {
    getAllUsers,
    getUserById,
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser
};