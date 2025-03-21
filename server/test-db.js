const db = require('./db');

async function testConnection() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connection successful. Current time:', result.rows[0].now);
    
    // Exit after testing
    process.exit(0);
  } catch (error) {
    console.error('Error testing database connection:', error);
    process.exit(1);
  }
}

testConnection();
