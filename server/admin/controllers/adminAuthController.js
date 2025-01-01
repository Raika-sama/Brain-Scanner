// server/admin/controllers/adminAuthController.js
const jwt = require('jsonwebtoken');
const User = require('../../models/Users');
const bcrypt = require('bcryptjs');

const adminAuthController = {
    loginPage: async (req, res) => {
        try {
            res.render('login', { error: null });
        } catch (error) {
            console.error('Error rendering login page:', error);
            res.render('error', { error: 'Errore nel caricamento della pagina' });
        }
    },

    signupPage: async (req, res) => {
        try {
            res.render('signup', { error: null });
        } catch (error) {
            console.error('Error rendering signup page:', error);
            res.render('error', { error: 'Errore nel caricamento della pagina' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email);

            const user = await User.findOne({ email });
            console.log('User found:', user ? 'yes' : 'no');
            
            if (!user) {
                console.log('User not found');
                return res.render('login', { error: 'Credenziali non valide' });
            }

            console.log('User role:', user.ruolo);

            if (user.ruolo !== 'amministratore' && user.ruolo !== 'superadmin') {
                console.log('User is not admin');
                return res.render('login', { error: 'Non hai i permessi di amministratore' });
            }

            console.log('Verifying password...');
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isValidPassword);

            if (!isValidPassword) {
                return res.render('login', { error: 'Credenziali non valide' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { 
                    userId: user._id, 
                    isAdmin: true,
                    ruolo: user.ruolo
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            req.session.adminToken = token;
            req.session.adminId = user._id;

            console.log('Login successful, redirecting to dashboard');
            return res.redirect('/admin/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            res.render('login', { error: 'Errore durante il login' });
        }
    },

    signup: async (req, res) => {
        try {
            const { nome, cognome, email, password } = req.body;
            console.log('Signup attempt for:', email);

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('signup', { error: 'Email già registrata' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                nome,
                cognome,
                email,
                password: hashedPassword,
                ruolo: 'amministratore',
                lastLogin: new Date()
            });

            await newUser.save();
            console.log('New admin user created:', email);

            const token = jwt.sign(
                { 
                    userId: newUser._id, 
                    isAdmin: true,
                    ruolo: newUser.ruolo
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            req.session.adminToken = token;
            req.session.adminId = newUser._id;

            return res.redirect('/admin/dashboard');

        } catch (error) {
            console.error('Signup error:', error);
            res.render('signup', { error: 'Errore durante la registrazione' });
        }
    },

    dashboard: async (req, res) => {
        try {
            if (!req.session.adminId) {
                return res.redirect('/admin/login');
            }

            const admin = await User.findById(req.session.adminId);
            if (!admin) {
                return res.redirect('/admin/login');
            }

            res.render('dashboard', { admin });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.render('error', { error: 'Errore nel caricamento della dashboard' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/admin/login');
        });
    }
};

module.exports = adminAuthController;