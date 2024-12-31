Documentazione Sistema di Autenticazione - Brain Scanner
1. Panoramica del Sistema
Il sistema di autenticazione di Brain Scanner è basato su JSON Web Token (JWT) e implementa un'architettura stateless per la gestione delle sessioni utente.

1.1 Componenti Principali
Frontend: React (client)
Backend: Node.js/Express
Token Storage: localStorage del browser
Middleware di Autenticazione: JWT-based
Database: MongoDB Atlas
2. Flusso di Autenticazione
2.1 Login/Registrazione
JavaScript
// authRoutes.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Verifica credenziali
  const token = jwt.sign({
    userId: user._id,
    email: user.email,
    ruolo: user.ruolo
  }, process.env.JWT_SECRET, { expiresIn: '24h' });
});
2.2 Gestione Token Frontend
JavaScript
// MainLayout.js
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
2.3 Protezione Route
JavaScript
// authMiddleware.js
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  // Verifica presenza e formato del token
  const token = authHeader.split(' ')[1];
  // Verifica validità token
  const decoded = jwt.verify(token, secretKey);
  req.user = decoded;
  next();
};
3. Configurazione
3.1 Variabili d'Ambiente Required
env
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
PORT=5000
3.2 CORS Configuration
JavaScript
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
4. Sicurezza Implementata
4.1 Password Hashing
Utilizzo di crypto.scrypt per l'hashing delle password
Salt univoco per ogni utente
Confronto sicuro tramite crypto.timingSafeEqual
4.2 Rate Limiting
JavaScript
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 5, // limite di 5 tentativi
});
4.3 Token Security
Durata token: 24 ore
Verifica signature con JWT_SECRET
Bearer scheme obbligatorio
Validazione payload completa
5. API Endpoints Protetti
5.1 Formato Richieste
HTTP
GET /api/protected-route
Authorization: Bearer <token>
5.2 Errori Comuni
JavaScript
{
  401: 'Token non valido o scaduto',
  403: 'Permessi insufficienti',
  429: 'Troppi tentativi di login'
}
6. Testing e Debug
6.1 Verifica Token
JavaScript
// Debug endpoint
router.get('/debug-user', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: user,
    tokenInfo: req.user
  });
});
6.2 Logging
JavaScript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
7. Best Practices Implementate
7.1 Frontend
Token stored in localStorage
Automatic token injection in requests
Token refresh handling
Logout cleanup
7.2 Backend
Environment variables validation
Error handling middleware
Secure password storage
Rate limiting
CORS configuration
8. Flow di Sviluppo
8.1 Aggiunta Nuova Route Protetta
JavaScript
router.get('/protected', authMiddleware, async (req, res) => {
  // Route implementation
});
8.2 Gestione Ruoli
JavaScript
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.ruolo)) {
    return res.status(403).json({
      success: false,
      message: 'Permesso negato'
    });
  }
  next();
};
9. Troubleshooting
9.1 Problemi Comuni
Token scaduto
Header Authorization mancante
Token malformato
CORS errors
9.2 Debug Steps
Verifica presenza token in localStorage
Controlla formato Authorization header
Verifica scadenza token
Controlla logs server
10. Manutenzione
10.1 Monitoraggio
Log errori di autenticazione
Monitoraggio tentativi di login falliti
Tracking sessioni attive
10.2 Updates
Aggiornamento regolare dipendenze
Review sicurezza periodica
Backup configurazioni
11. Note per il Team
Non modificare JWT_SECRET in production
Mantenere aggiornate le whitelist CORS
Implementare monitoring per failed attempts
Seguire le best practices per password storage
Documentare qualsiasi modifica al sistema di auth