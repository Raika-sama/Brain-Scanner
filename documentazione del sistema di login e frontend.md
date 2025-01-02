Markdown
# Brain Scanner - Documentazione Frontend Auth System

## Architettura Generale

### 1. Struttura dei Componenti
```mermaid
graph TD
    A[App] --> B[LoginPage]
    B --> C[Login Component]
    B --> D[Registration Component]
    E[Auth Context] --> B
    E --> F[Protected Routes]
2. Sistema di Autenticazione
2.1 Hook useAuth
Posizione: src/hooks/useAuth.js
Funzionalità: Gestisce tutta la logica di autenticazione centralizzata
Metodi principali:
login(email, password, rememberMe)
register(userData)
logout()
isLoading e error states
2.2 Flusso di Autenticazione
L'utente inserisce le credenziali
Il sistema effettua la chiamata API
In caso di successo:
Salva il token JWT in localStorage
Salva i dati utente
Aggiorna il context
Reindirizza alla dashboard
In caso di errore:
Mostra feedback all'utente
Mantiene l'utente nella pagina di login
3. Componenti UI
3.1 LoginPage (src/pages/LoginPage.js)
Container principale con gestione tab login/registrazione
Implementa animazioni con Framer Motion
Gestisce il routing condizionale
Design Features:

Glassmorphism UI
Animazioni fluide tra tab
Background gradient
Loading states animati
3.2 Login Component (src/components/Login.js)
Form di login con validazione
Integrazione con useAuth
Stati di loading e gestione errori
Animazioni di feedback
Props e Stati:

JavaScript
{
  email: string,
  password: string,
  rememberMe: boolean,
  isLoading: boolean,
  error: string | null
}
3.3 Registration Component (src/components/Registration.js)
Form di registrazione completo
Validazione password in tempo reale
Selezione ruolo utente
Feedback stati form
Form Data Structure:

JavaScript
{
  nome: string,
  cognome: string,
  email: string,
  password: string,
  confirmPassword: string,
  ruolo: 'studente' | 'insegnante' | 'amministratore'
}
4. Stili e Design System
4.1 Colori
JavaScript
const colors = {
  primary: {
    light: '#60A5FA',  // blue-400
    default: '#2563EB', // blue-600
    dark: '#1D4ED8'     // blue-700
  },
  background: {
    gradient: 'from-blue-50 via-purple-50 to-pink-50'
  }
}
4.2 Animazioni
Utilizzo di Framer Motion per:

Transizioni tra form
Feedback interazioni
Loading states
Error messages
5. Best Practices Implementate
Sicurezza:

Validazione input
Sanitizzazione dati
Gestione token JWT
Protezione routes
UX:

Feedback immediato
Loading states chiari
Gestione errori user-friendly
Animazioni intuitive
Performance:

Code splitting
Lazy loading componenti
Ottimizzazione re-render
6. Dipendenze
JSON
{
  "framer-motion": "^10.x.x",
  "react-hot-toast": "^2.x.x",
  "lucide-react": "^0.x.x",
  "@mui/material": "^5.x.x"
}
7. Setup e Configurazione
Installare le dipendenze:
npm install framer-motion react-hot-toast lucide-react @mui/material
Configurare il file .env:
REACT_APP_API_URL=your_api_url
Importare i componenti necessari e configurare il routing
8. Manutenzione e Sviluppi Futuri
Implementazione 2FA
Social login
Password recovery system
Session management avanzato
Analytics di login/registrazione