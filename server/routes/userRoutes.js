// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/debug-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const schools = await user.getSchools(); // ottiene tutte le scuole associate
        
        console.log('Debug User Data:', {
            user,
            schools
        });
        
        res.json({
            success: true,
            user: user,
            schools: schools,
            tokenInfo: req.user
        });
    } catch (error) {
        console.error('Debug Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        console.log('UserID from token:', req.user.userId);
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utente non trovato'
            });
        }

        const defaultSchool = await user.getDefaultSchool();

        // Log per debug con nomi coerenti
        console.log('User details:', {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            school: defaultSchool
        });

        res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                school: defaultSchool
            }
        });
    } catch (error) {
        console.error('Error in /me:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dei dati utente'
        });
    }
});

module.exports = router;