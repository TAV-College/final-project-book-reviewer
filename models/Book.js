const db = require('../config/db');

class Book {
  // Find all books
  static findAll(callback) {
    const sql = 'SELECT * FROM books ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }

  // Find book by ID
  static findById(id, callback) {
    const sql = 'SELECT * FROM books WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Find book by ISBN
  static findByISBN(isbn, callback) {
    const sql = 'SELECT * FROM books WHERE isbn = ?';
    db.get(sql, [isbn], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Create a new book
  static create(bookData, callback) {
    const { title, author, isbn, publisher, published_date, description, page_count, category, thumbnail } = bookData;
    
    const sql = `
      INSERT INTO books (title, author, isbn, publisher, published_date, description, page_count, category, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      sql,
      [title, author, isbn, publisher, published_date, description, page_count, category, thumbnail],
      function(err) {
        if (err) {
          return callback(err, null);
        }
        callback(null, { id: this.lastID, ...bookData });
      }
    );
  }

  // Update a book
  static update(id, bookData, callback) {
    const { title, author, isbn, publisher, published_date, description, page_count, category, thumbnail } = bookData;
    
    const sql = `
      UPDATE books SET
        title = ?,
        author = ?,
        isbn = ?,
        publisher = ?,
        published_date = ?,
        description = ?,
        page_count = ?,
        category = ?,
        thumbnail = ?
      WHERE id = ?
    `;
    
    db.run(
      sql,
      [title, author, isbn, publisher, published_date, description, page_count, category, thumbnail, id],
      function(err) {
        if (err) {
          return callback(err, null);
        }
        callback(null, { id, ...bookData });
      }
    );
  }

  // Delete a book
  static delete(id, callback) {
    const sql = 'DELETE FROM books WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, deleted: this.changes > 0 });
    });
  }

  // Search books by title or author
  static search(query, callback) {
    const searchTerm = `%${query}%`;
    const sql = 'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY title';
    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }
}

module.exports = Book;