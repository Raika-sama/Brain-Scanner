const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 2. Create Express app
const app = express();

// Middleware di base DEVE STARE ALL'INIZIO
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Connessione al database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ai4sDB'  // Specifica esplicitamente il nome del database
  })
  .then(() => {
    console.log('Connesso al database MongoDB');
    // Stampa il nome del database a cui sei connesso
    console.log('Database name:', mongoose.connection.name);
    // Stampa l'URI di connessione (nascondi la password per sicurezza)
    const sanitizedUri = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log('MongoDB URI:', sanitizedUri);
  })
  .catch(err => {
    console.error('Errore di connessione al database:', err);
    process.exit(1);  // Termina l'applicazione se non riesce a connettersi al database
  });


// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const classRoutes = require('./routes/classRoutes');  // Aggiungiamo questa linea


// All'inizio del file, dopo require('dotenv').config()
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Variabili d\'ambiente mancanti:', missingEnvVars.join(', '));
  process.exit(1);
}

// server/app.js
require('./models/Schools');
require('./models/Users');
require('./models/Class');

// Aggiungi anche questi listener per gestire gli eventi di connessione
mongoose.connection.on('connected', () => {
  console.log('Mongoose connesso');
});

// Gestione eventi di connessione MongoDB
mongoose.connection.on('error', err => {
  console.error('Errore MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnesso');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB disconnesso per termine applicazione');
    process.exit(0);
  });
});

// Middleware di logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/classes', classRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/classes', classRoutes);  // Aggiungiamo questa linea

// Gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Risorsa non trovata'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});

module.exports = app;