/**
 * Authentication middleware
 * Checks if user is authenticated for protected routes
 */
const isAuthenticated = (req, res, next) => {
  // Check if user is authenticated via session
  if (req.session && req.session.user) {
    return next();
  }
  
  // Redirect to login page if not authenticated
  req.session.returnTo = req.originalUrl;
  res.redirect('/users/login');
};

/**
 * Guest middleware
 * For routes that should only be accessible to non-authenticated users
 */
const isGuest = (req, res, next) => {
  // If user is logged in, redirect to home page
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  
  next();
};

module.exports = {
  isAuthenticated,
  isGuest
};