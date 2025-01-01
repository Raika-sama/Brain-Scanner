// server/admin/routes/adminAuthRoutes.js
const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const User = require('../../models/Users'); // il modello Users è stato importato

// Middleware per verificare l'autenticazione
const isAuthenticated = (req, res, next) => {
    if (req.session.adminId) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Route pubbliche
router.get('/login', adminAuthController.loginPage);
router.post('/login', adminAuthController.login);
router.get('/signup', adminAuthController.signupPage);
router.post('/signup', adminAuthController.signup);

// Route protette
router.get('/dashboard', isAuthenticated, adminAuthController.dashboard);
router.get('/logout', isAuthenticated, adminAuthController.logout);

module.exports = router;