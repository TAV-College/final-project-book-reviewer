const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const methodOverride = require('method-override');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import custom middleware
const logger = require('./middleware/logger');

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(logger);

// Session setup
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite' }),
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  next();
});

// Routes
app.use('/books', bookRoutes);
app.use('/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.session.user
  });
});

module.exports = app;