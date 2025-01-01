// server/admin/middleware/adminAuthMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../../models/Users');

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.session.adminToken;
        
        if (!token) {
            return res.redirect('/admin/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findOne({ 
            _id: decoded.userId,
            isAdmin: true 
        });

        if (!admin) {
            return res.redirect('/admin/login');
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.redirect('/admin/login');
    }
};

module.exports = adminAuthMiddleware;