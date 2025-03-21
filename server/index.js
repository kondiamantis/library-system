   // server/index.js
   const express = require('express');
   const cors = require('cors');
   const db = require('./db');
   
   const app = express();
   const PORT = process.env.PORT || 5000;
   
   app.use(cors());
   app.use(express.json());
   
   // Book routes
   app.get('/api/books', async (req, res) => {
     try {
       const result = await db.query('SELECT * FROM books');
       res.json(result.rows);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   app.get('/api/books/:id', async (req, res) => {
     try {
       const { id } = req.params;
       const result = await db.query('SELECT * FROM books WHERE id = $1', [id]);
       
       if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Book not found' });
       }
       
       res.json(result.rows[0]);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   app.post('/api/books', async (req, res) => {
     try {
       const { title, author, isbn, published_year, genre, description, cover_image } = req.body;
       const result = await db.query(
         'INSERT INTO books (title, author, isbn, published_year, genre, description, cover_image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
         [title, author, isbn, published_year, genre, description, cover_image]
       );
       
       res.status(201).json(result.rows[0]);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   app.put('/api/books/:id', async (req, res) => {
     try {
       const { id } = req.params;
       const { title, author, isbn, published_year, genre, description, cover_image, is_available } = req.body;
       
       const result = await db.query(
         'UPDATE books SET title = $1, author = $2, isbn = $3, published_year = $4, genre = $5, description = $6, cover_image = $7, is_available = $8 WHERE id = $9 RETURNING *',
         [title, author, isbn, published_year, genre, description, cover_image, is_available, id]
       );
       
       if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Book not found' });
       }
       
       res.json(result.rows[0]);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   app.delete('/api/books/:id', async (req, res) => {
     try {
       const { id } = req.params;
       const result = await db.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
       
       if (result.rows.length === 0) {
         return res.status(404).json({ error: 'Book not found' });
       }
       
       res.status(204).end();
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   // Implement user routes
   app.get('/api/users', async (req, res) => {
     try {
       const result = await db.query('SELECT id, username, email, role, created_at FROM users');
       res.json(result.rows);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   // Implement loan routes
   app.get('/api/loans', async (req, res) => {
     try {
       const result = await db.query('SELECT * FROM loans');
       res.json(result.rows);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   // Add more endpoints for users and loans similar to books
   
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   