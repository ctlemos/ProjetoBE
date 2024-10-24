const pool = require('./connection');

//mostrar todos os users
async function getAllUsers() {
    return pool.query("SELECT name, last_name, email FROM users");
}

//procurar user por ID
async function getUserById(userId) {
    return pool.query("SELECT name, last_name, email FROM users WHERE user_id = ?", [userId]);
}

//procurar user por email
async function findUserByEmail(email) {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];  // mostrar o primeiro user encontrado ou not found
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
    }
}

//criar novo user
async function createUser(newUser) {
    const query = "INSERT INTO users (name, last_name, password, nif, email, phone, address, postal_code, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
    ]);
    return results.insertId;
}

//editar user
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

// Update isAdmin estado de um user
async function updateUserAdminStatus(userId, isAdmin) {
    const query = 'UPDATE users SET is_admin = ? WHERE id = ?';
    const [result] = await pool.query(query, [isAdmin, userId]);
    return result.affectedRows; // Return the number of affected rows
}

//apagar user por ID
async function deleteUser(userId) {
    return pool.query("DELETE FROM users WHERE user_id = ?", [userId]);
}

module.exports = {
    getAllUsers,
    getUserById,
    findUserByEmail,
    createUser,
    updateUser,
    updateUserAdminStatus,
    deleteUser
};