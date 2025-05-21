const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  // Find user by ID
  static findById(id, callback) {
    const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Find user by username
  static findByUsername(username, callback) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, row);
    });
  }

  // Create a new user
  static create(userData, callback) {
    const { username, password, email } = userData;
    
    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return callback(err, null);
      }
      
      const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
      
      db.run(sql, [username, hashedPassword, email], function(err) {
        if (err) {
          return callback(err, null);
        }
        
        // Return user data without the password
        const newUser = {
          id: this.lastID,
          username,
          email
        };
        
        callback(null, newUser);
      });
    });
  }

  // Authenticate a user
  static authenticate(username, password, callback) {
    this.findByUsername(username, (err, user) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!user) {
        return callback(null, false);
      }
      
      // Compare the provided password with the stored hash
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return callback(err, null);
        }
        
        if (!result) {
          return callback(null, false);
        }
        
        // Return user data without the password
        const authenticatedUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        };
        
        callback(null, authenticatedUser);
      });
    });
  }
}

module.exports = User;