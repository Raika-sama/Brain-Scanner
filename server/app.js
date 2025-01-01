const path = require('path');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Verifica variabili d'ambiente
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('Variabili d\'ambiente mancanti:', missingEnvVars.join(', '));
    process.exit(1);
}

// Create Express app
const app = express();

// Middleware di base
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: false, // Necessario per EJS
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione sessione
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 ore
    }
}));

// Configurazione view engine
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'admin/views'),
    path.join(__dirname, 'views')
]);

// Middleware di logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Connessione al database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ai4sDB'
})
.then(() => {
    console.log('Connesso al database MongoDB');
    console.log('Database name:', mongoose.connection.name);
    const sanitizedUri = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log('MongoDB URI:', sanitizedUri);
})
.catch(err => {
    console.error('Errore di connessione al database:', err);
    process.exit(1);
});

// Require models
require('./models/Schools');
require('./models/Users');
require('./models/Class');
require('./models/Student');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminAuthRoutes = require('./admin/routes/adminAuthRoutes');

// Static files
app.use('/admin/static', express.static(path.join(__dirname, 'public/admin')));
app.use(express.static(path.join(__dirname, 'public')));

// Admin middleware
const adminMiddleware = (req, res, next) => {
    // Aggiungi proprietà isAdmin alla response locals per le viste
    res.locals.isAdmin = req.session.adminId ? true : false;
    console.log('Admin route hit:', req.path);
    next();
};

// Admin routes
app.use('/admin', adminMiddleware, adminAuthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);

// Gestione delle route non-admin in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
            next();
        } else {
            res.redirect(`http://localhost:3000${req.path}`);
        }
    });
}

// Production static files
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('/*', (req, res, next) => {
        if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
            next();
        } else {
            res.sendFile(path.join(__dirname, '../client/build/index.html'));
        }
    });
}

// Gestione degli errori
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (req.path.startsWith('/admin')) {
        res.status(500).render('error', { 
            error: process.env.NODE_ENV === 'development' ? err.message : 'Errore interno del server',
            isAdmin: req.session.adminId ? true : false
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: process.env.NODE_ENV === 'development' ? err.message : {}
        });
    }
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/admin')) {
        res.status(404).render('error', { 
            error: 'Pagina non trovata',
            isAdmin: req.session.adminId ? true : false
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Risorsa non trovata'
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

module.exports = app;