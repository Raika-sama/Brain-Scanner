# Report Tecnico - AI4S Testing Platform

## 1. Struttura del Progetto

### 1.1 Architettura
Il progetto è strutturato in tre componenti principali:
- Frontend React (porta 3000/3001)
- Backend Node.js (porta 5000)
- Microservizi Python (porta 5001)

### 1.2 Struttura Cartelle
```
ai4s/
├── client/
│   └── src/
│       ├── components/
│       │   ├── AvailableTests.js
│       │   ├── RecentResults.js
│       │   ├── Login.js
│       │   └── Registration.js
│       └── pages/
│           ├── LoginPage.js
│           ├── Dashboard.js
│           ├── TestPage.js
│           └── ResultPage.js
├── server/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── testRoutes.js
│   │   └── resultRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Test.js
│   │   └── Result.js
│   └── app.js
└── engines/
    ├── shared/
    │   ├── config.py
    │   ├── logger.py
    │   ├── auth.py
    │   └── models.py
    └── stili_cognitivi/
        ├── main.py
        ├── calculator.py
        └── validators.py
```

## 2. Sistema di Autenticazione

### 2.1 JWT Implementation
- Token JWT generato al login/registrazione
- Payload contiene: userId, email, ruolo
- Token verificato sia dal backend Node.js che dai microservizi Python
- Durata token: 24 ore

### 2.2 Flusso di Autenticazione
1. Cliente effettua login/registrazione → server genera JWT
2. Token salvato in localStorage del browser
3. Token incluso in header Authorization per ogni richiesta
4. Middleware verifica token per route protette

### 2.3 Sicurezza
- CORS configurato per origini specifiche (localhost:3000/3001)
- Password hashate con bcrypt
- Validazione JWT su ogni richiesta
- Gestione errori per token scaduti/invalidi

## 3. Configurazione Ambiente

### 3.1 Variabili d'Ambiente
File .env presenti in:
- /server/.env
- /engines/stili_cognitivi/.env
- /client/.env

Variabili principali:
```
JWT_SECRET=chiave-segreta-jwt
FLASK_ENV=dev
MONGODB_URI=mongodb-connection-string
PORT=5000
```

### 3.2 Database
- MongoDB Atlas per persistenza dati
- Modelli Mongoose per User, Test, Result

## 4. Microservizio Stili Cognitivi

### 4.1 Funzionalità
- Calcolo profilo basato su 30 domande
- 5 categorie con 6 domande ciascuna
- Generazione consigli personalizzati
- Logging completo delle operazioni

### 4.2 API Endpoints
- GET /health - Health check
- POST /calculate - Calcolo profilo
  - Richiede autenticazione
  - Validazione input
  - Verifica permessi utente

## 5. Stato dell'Arte

### 5.1 Completato
- Sistema di autenticazione JWT
- Integrazione frontend-backend
- Primo microservizio Python
- Health check funzionante
- Calcolo profilo funzionante

### 5.2 In Test
- Gestione errori
- Logging sistema
- Validazione input
- Flusso dati completo

## 6. Implementazioni Future

### 6.1 Frontend
- Pagina compilazione test
- Visualizzazione grafica risultati
- Dashboard interattiva
- Gestione storico test

### 6.2 Backend
- Generazione PDF risultati
- API per statistiche aggregate
- Gestione multipli test
- Backup automatico dati

### 6.3 Microservizi
- Implementazione altri test
- Ottimizzazione performance
- Sistema di caching
- Scalabilità orizzontale

### 6.4 Sicurezza
- Rate limiting
- Audit logging
- Backup encryption
- GDPR compliance

## 7. Note per lo Sviluppo

### 7.1 Setup Ambiente
1. Installare dipendenze:
   ```bash
   # Backend
   cd server && npm install
   
   # Frontend
   cd client && npm install
   
   # Python
   cd engines/stili_cognitivi
   pip install -r requirements.txt
   ```

2. Configurare variabili ambiente
3. Avviare servizi:
   ```bash
   # Backend
   cd server && npm start
   
   # Frontend
   cd client && npm start
   
   # Microservizio
   cd engines/stili_cognitivi && python main.py
   ```

### 7.2 Best Practices
- Mantenere consistenza JWT tra servizi
- Logging dettagliato operazioni
- Validazione input rigorosa
- Test prima del deploy

## 8. Contatti e Risorse
- Documentazione API: [da implementare]
- Repository: [da implementare]
- Team Lead: [da implementare]
