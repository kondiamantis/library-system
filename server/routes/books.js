const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all books
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books ORDER BY title');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM books WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, published_year, genre, description, cover_image, is_available } = req.body;
    const result = await db.query(
      `INSERT INTO books (title, author, isbn, published_year, genre, description, cover_image, is_available) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, author, isbn, published_year, genre, description, cover_image, is_available]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, published_year, genre, description, cover_image, is_available } = req.body;
    const result = await db.query(
      `UPDATE books 
       SET title = $1, author = $2, isbn = $3, published_year = $4, 
           genre = $5, description = $6, cover_image = $7, is_available = $8
       WHERE id = $9 
       RETURNING *`,
      [title, author, isbn, published_year, genre, description, cover_image, is_available, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
