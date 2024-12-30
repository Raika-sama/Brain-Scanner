// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const rateLimit = require('express-rate-limit'); // Time limiter


// Configurazione rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 5, // limite di 5 tentativi
    message: {
        success: false,
        message: 'Troppi tentativi di login. Riprova tra 15 minuti.'
    }
});

// Ottieni la chiave segreta dalle variabili d'ambiente
const secretKey = process.env.JWT_SECRET;

// Verifica che la chiave segreta sia definita
if (!secretKey) {
    throw new Error("JWT_SECRET environment variable not defined.");
}

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: 'Autenticazione richiesta. Header mancante.' 
        });
    }

    // Verifica che l'header inizi con "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            message: 'Formato token non valido. Utilizzare Bearer scheme.' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Usa la stessa chiave segreta usata in authRoutes.js
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Errore verifica token:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token scaduto. Effettua nuovamente il login.' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: 'Token non valido.' 
        });
    }
};

module.exports = {
    authMiddleware,
    loginLimiter
};