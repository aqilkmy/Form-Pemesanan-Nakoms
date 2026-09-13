const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  console.log("Starting import to Hostinger MySQL...");
  const sqlFilePath = path.join(__dirname, '..', 'BackupDB', 'hostinger_full_import.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error("File hostinger_full_import.sql not found at:", sqlFilePath);
    return;
  }
  
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
  console.log(`Read SQL file (${sqlContent.length} bytes). Connecting to Hostinger...`);
  
  const connection = await mysql.createConnection({
    host: '153.92.15.57',
    port: 3306,
    user: 'u256329210_rismedorder',
    password: 'M3DI<0MI3ANGGa',
    database: 'u256329210_rismedorder',
    multipleStatements: true,
    connectTimeout: 30000
  });

  try {
    console.log("Executing SQL statements...");
    const startTime = Date.now();
    await connection.query(sqlContent);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`SUCCESS: Imported successfully in ${duration}s!`);

    // Verify row counts
    const [contacts] = await connection.query("SELECT COUNT(*) as count FROM pj_contacts;");
    const [mappings] = await connection.query("SELECT COUNT(*) as count FROM pj_mappings;");
    const [orders] = await connection.query("SELECT COUNT(*) as count FROM orders;");
    
    console.log("Verification Row Counts:");
    console.log(`- pj_contacts: ${contacts[0].count} rows`);
    console.log(`- pj_mappings: ${mappings[0].count} rows`);
    console.log(`- orders: ${orders[0].count} rows`);
  } catch (err) {
    console.error("Error during import:", err.message);
  } finally {
    await connection.end();
  }
}

importDatabase();
