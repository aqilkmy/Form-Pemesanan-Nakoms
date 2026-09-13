const mysql = require('mysql2/promise');

async function testConnection() {
  console.log("Testing connection to Hostinger MySQL...");
  try {
    const connection = await mysql.createConnection({
      host: '153.92.15.57',
      port: 3306,
      user: 'u256329210_rismedorder',
      password: 'M3DI<0MI3ANGGa',
      database: 'u256329210_rismedorder',
      connectTimeout: 10000
    });
    
    console.log("SUCCESS: Connected to Hostinger MySQL successfully!");
    const [rows] = await connection.query("SHOW TABLES;");
    console.log("Current tables in database:", rows);
    await connection.end();
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testConnection();
