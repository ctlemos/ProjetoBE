const mysql = require('mysql2');

/* Estabelecer a conexão com a BD */
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,          
    password: '',  
    database: process.env.DB_NAME          
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME,          
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = pool.promise();