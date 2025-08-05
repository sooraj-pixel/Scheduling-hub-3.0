const mysql = require('mysql2/promise');
require('dotenv').config(); // Ensure dotenv is loaded to access process.env

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
  port: process.env.MYSQL_DB_PORT || 3306, // Use || for default value
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Backend MySQL pool connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('Backend MySQL pool connection failed:', err);
  });

module.exports = pool;