const path = require('path');
const express = require('express');
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
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

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
require('./models/Student'); // Aggiungi questa riga

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes'); // Aggiungi questa riga


// Middleware di logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});





// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/classes', classRoutes);

// DEBUG rotte studenti
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  next();
});
app.use('/api/students', studentRoutes); 


// Gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Production static files
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