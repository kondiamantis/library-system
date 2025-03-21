const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../db');

async function importData() {
  try {
    console.log('Starting data migration...');

    // Read the data from your JSON Server db.json file
    const dbFilePath = path.join(__dirname, '../../db.json');
    const data = JSON.parse(await fs.readFile(dbFilePath, 'utf8'));
    
    // Begin a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Import books
      if (data.books && Array.isArray(data.books)) {
        console.log(`Importing ${data.books.length} books...`);
        
        for (const book of data.books) {
          await client.query(
            `INSERT INTO books (
              title, author, isbn, published_year, genre, description, cover_image, is_available
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (isbn) DO NOTHING`,
            [
              book.title,
              book.author,
              book.isbn,
              book.published_year,
              book.genre,
              book.description,
              book.cover_image,
              book.is_available !== false
            ]
          );
        }
      }
      
      // Import users
      if (data.users && Array.isArray(data.users)) {
        console.log(`Importing ${data.users.length} users...`);
        
        for (const user of data.users) {
          await client.query(
            `INSERT INTO users (
              username, password, email, role, created_at
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO NOTHING`,
            [
              user.username,
              user.password,
              user.email,
              user.role || 'user',
              user.created_at || new Date()
            ]
          );
        }
      }
      
      // Import loans
      if (data.loans && Array.isArray(data.loans)) {
        console.log(`Importing ${data.loans.length} loans...`);
        
        for (const loan of data.loans) {
          await client.query(
            `INSERT INTO loans (
              user_id, book_id, loan_date, due_date, return_date
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              loan.user_id,
              loan.book_id,
              loan.loan_date || new Date(),
              loan.due_date,
              loan.return_date
            ]
          );
        }
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Data migration completed successfully!');
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('Error during migration, transaction rolled back:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the import function
importData();
