const express = require('express');
const router = express.Router();
const axios = require('axios');
const Book = require('../models/Book');
const { isAuthenticated } = require('../middleware/auth');

// Get all books in the library
router.get('/', (req, res) => {
  Book.findAll((err, books) => {
    if (err) {
      console.error('Error fetching books:', err);
      req.session.error = 'Failed to load books';
      return res.render('books/index', { books: [], user: req.session.user });
    }
    res.render('books/index', { books, user: req.session.user });
  });
});

// Search for books in Google Books API
router.get('/search', (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.render('books/search', { 
      books: [], 
      query: '',
      user: req.session.user 
    });
  }
  
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`;
  
  axios.get(url)
    .then(response => {
      const books = response.data.items?.map(item => {
        const volumeInfo = item.volumeInfo;
        return {
          googleId: item.id,
          title: volumeInfo.title || 'Unknown Title',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
          isbn: volumeInfo.industryIdentifiers ? 
            volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || 
            volumeInfo.industryIdentifiers[0]?.identifier || 
            null : null,
          publisher: volumeInfo.publisher,
          published_date: volumeInfo.publishedDate,
          description: volumeInfo.description,
          page_count: volumeInfo.pageCount,
          category: volumeInfo.categories ? volumeInfo.categories[0] : null,
          thumbnail: volumeInfo.imageLinks?.thumbnail || null
        };
      }) || [];
      
      res.render('books/search', { 
        books, 
        query,
        user: req.session.user 
      });
    })
    .catch(error => {
      console.error('Error searching Google Books API:', error);
      req.session.error = 'Failed to search for books';
      res.render('books/search', { 
        books: [], 
        query,
        user: req.session.user 
      });
    });
});

// Add a book to the library
router.post('/', isAuthenticated, (req, res) => {
  const bookData = {
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    publisher: req.body.publisher,
    published_date: req.body.published_date,
    description: req.body.description,
    page_count: req.body.page_count,
    category: req.body.category,
    thumbnail: req.body.thumbnail
  };
  
  // Check if the book already exists in our library
  if (bookData.isbn) {
    Book.findByISBN(bookData.isbn, (err, existingBook) => {
      if (err) {
        console.error('Error checking book existence:', err);
      }
      
      if (existingBook) {
        req.session.error = 'This book is already in your library';
        return res.redirect('/books');
      }
      
      // Book doesn't exist yet, add it
      Book.create(bookData, (err, book) => {
        if (err) {
          console.error('Error adding book:', err);
          req.session.error = 'Failed to add book to library';
          return res.redirect('/books/search');
        }
        
        req.session.success = 'Book added to library successfully';
        res.redirect('/books');
      });
    });
  } else {
    // No ISBN, just add the book
    Book.create(bookData, (err, book) => {
      if (err) {
        console.error('Error adding book:', err);
        req.session.error = 'Failed to add book to library';
        return res.redirect('/books/search');
      }
      
      req.session.success = 'Book added to library successfully';
      res.redirect('/books');
    });
  }
});

// Get a specific book
router.get('/:id', (req, res) => {
  const id = req.params.id;
  
  Book.findById(id, (err, book) => {
    if (err || !book) {
      console.error('Error fetching book:', err);
      req.session.error = 'Book not found';
      return res.redirect('/books');
    }
    
    res.render('books/show', { book, user: req.session.user });
  });
});

// Delete a book
router.delete('/:id', isAuthenticated, (req, res) => {
  const id = req.params.id;
  
  Book.delete(id, (err, result) => {
    if (err) {
      console.error('Error deleting book:', err);
      req.session.error = 'Failed to delete book';
    } else if (result.deleted) {
      req.session.success = 'Book deleted successfully';
    } else {
      req.session.error = 'Book not found';
    }
    
    res.redirect('/books');
  });
});

module.exports = router;