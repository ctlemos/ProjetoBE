const mysql = require('mysql2');

/* estabelecer a conexão com a BD */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',          
    password: '',  
    database: 'olga_lemos' 
}); 

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'olga_lemos',
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