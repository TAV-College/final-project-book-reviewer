const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isGuest, isAuthenticated } = require('../middleware/auth');

// Login form
router.get('/login', isGuest, (req, res) => {
  res.render('users/login', { user: null });
});

// Login process
router.post('/login', isGuest, (req, res) => {
  const { username, password } = req.body;
  
  // Validate form input
  if (!username || !password) {
    req.session.error = 'Username and password are required';
    return res.redirect('/users/login');
  }
  
  User.authenticate(username, password, (err, user) => {
    if (err) {
      console.error('Authentication error:', err);
      req.session.error = 'An error occurred during login';
      return res.redirect('/users/login');
    }
    
    if (!user) {
      req.session.error = 'Invalid username or password';
      return res.redirect('/users/login');
    }
    
    // Set user in session
    req.session.user = user;
    req.session.success = 'You are now logged in';
    
    // Redirect to original requested URL or default to home
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  });
});

// Register form
router.get('/register', isGuest, (req, res) => {
  res.render('users/register', { user: null });
});

// Register process
router.post('/register', isGuest, (req, res) => {
  const { username, email, password, password2 } = req.body;
  
  // Validate form input
  const errors = [];
  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (password !== password2) errors.push('Passwords do not match');
  
  if (errors.length > 0) {
    req.session.error = errors.join(', ');
    return res.redirect('/users/register');
  }
  
  User.create({ username, email, password }, (err, user) => {
    if (err) {
      console.error('Registration error:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        req.session.error = 'Username or email already exists';
      } else {
        req.session.error = 'Failed to create user';
      }
      return res.redirect('/users/register');
    }
    
    req.session.success = 'Registration successful, you can now log in';
    res.redirect('/users/login');
  });
});

// Logout
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;