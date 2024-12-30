## Descrizione
Questo progetto mira a sviluppare un'applicazione web per la somministrazione di test psicologici, con funzionalità di analisi dei dati e generazione di report. L'applicazione sarà conforme al GDPR e permetterà la somministrazione di test multipli, la generazione di PDF personalizzati per studente e la visualizzazione di dati aggregati per classe.

## Stato attuale

### Funzionalità implementate
* **Frontend (React):**
    * Autenticazione: Login e registrazione utente con JWT.
    * Dashboard: Visualizzazione delle informazioni utente,  lista dei test disponibili (componente `AvailableTests`) e risultati recenti (componente `RecentResults`).
    * Navigazione tra le pagine: Login, Dashboard, Test e Risultati.
    * Somministrazione test: Pagina per la visualizzazione e la risposta alle domande del test.
    * Visualizzazione risultati: Pagina per la visualizzazione dei risultati del test, con punteggio e profilo (per il test degli stili cognitivi).
    * Logout: Funzionalità per terminare la sessione utente.
* **Backend (Node.js & Express):**
    * API per la gestione degli utenti: Registrazione, login, recupero dati utente.
    * API per la gestione dei test: Recupero della lista dei test.
    * API per la gestione dei risultati: Salvataggio e recupero dei risultati dei test.
    * Middleware per l'autenticazione JWT.
    * Connessione al database MongoDB Atlas.
* **Microservizi (Python):**
    * Microservizio per il calcolo del profilo e dei punteggi del test degli stili cognitivi.
    * Funzione `calcolaProfilo` implementata per il test degli stili cognitivi.
    * Integrazione parziale del microservizio con il backend Node.js.

### Struttura del progetto
## Cronologia

**25/12/2024:** 
    * Creazione del repository su GitHub.
    * Definizione della struttura del progetto (frontend React, backend Node.js, engine Python).
    * Scelta di MongoDB Atlas come database.
    * Installazione di Node.js e creazione dell'app React.
    * Risoluzione di un conflitto di dipendenze durante l'installazione di React.
    * Aggiunta della stringa di connessione a MongoDB Atlas nel file `server/app.js`.
    * Discussione sull'hosting e scelta di utilizzare un servizio con supporto per MongoDB e deploy da GitHub.
    * Definizione del formato dati JSON per i test.
    * Discussione sulla gestione degli utenti e conformità al GDPR.
    * Definizione del ruolo dell'insegnante e funzionalità di caricamento studenti da Excel.
    * Creazione dei componenti React per la pagina di login (`Login.js`) e registrazione (`Registration.js`).
    * Creazione della pagina `LoginPage.js` che include i componenti di login e registrazione.
    *Installazione delle dipendenze frontend: `react`, `react-router-dom`, `fetch` (nella cartella `client`).
    * Installazione delle dipendenze backend: `express`, `mongoose`, 'bcrypt', 'jsonwebtoken' (nella cartella `server`).     


## Prossimi passi

* Sviluppo del backend (Node.js ed Express.js) per la gestione degli utenti e l'autenticazione.
* Implementazione della funzionalità di caricamento studenti da Excel.
* Integrazione degli engine dei test (Python).
* Sviluppo della funzionalità di somministrazione test multipli.
* Sviluppo della funzionalità di generazione PDF personalizzati.
* Sviluppo della funzionalità di visualizzazione dati aggregati per classe.
* Test e deploy dell'applicazione.
* Ricorda che il codice per inviare i dati al backend (// TODO: ...) è ancora da implementare.

## Tecnologie

* **Frontend:** React, JavaScript, HTML, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Engine dei test:** Python
* **Controllo versione:** Git e GitHub
* **Hosting:** Da definire (Heroku o DigitalOcean)

## Struttura del progetto
## Prossimi passi

* Definizione dettagliata delle funzionalità dell'applicazione.
* Progettazione dell'interfaccia utente.
* Sviluppo del backend (Node.js ed Express.js).
* Integrazione degli engine dei test (Python).
* Test e deploy dell'applicazione.

## Tecnologie

* **Frontend:** React, JavaScript, HTML, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Engine dei test:** Python
* **Controllo versione:** Git e GitHub
* **Hosting:** Da definire (Heroku o DigitalOcean)

ai4s/
├── client/
│   └── engines/
│       └── stili_cognitivi/
│           └── main.py
│           └── auth.py
│           └── calculator.py
│           └── utils.py
│           └── validators.py
│           └── config.py
│           └── logger.py
│           └── models.py
│       └── venv/
│   └── src/
│       └── components/
│           └── AvailableTests.js
│           └── RecentResults.js
│           └── Login.js
│           └── Registration.js
│           └── Sidebar.js
│       └── layout
│           └──MainLayout.js
│       └──lib.js
│           └──utils.js
│       └── ui
│           └── card.js
│           └── dard.jsx
│       └── pages/
│           └── LoginPage.js
│           └── Dashboard.js
│           └── TestPage.js
│           └── ResultPage.js
│       └── App.js
├── server/

│   └── routes/
│       └── authRoutes.js
│       └── userRoutes.js
│       └── testRoutes.js
│       └── resultRoutes.js
│   └── middleware/
│       └── authMiddleware.js
│   └── models/
│       └── User.js
│       └── Test.js
│       └── Result.js
│   └── app.js
├── engines/

│   └── stili_cognitivi/
│       └── main.py
└── ...


## Implementazioni future

### Criticità
* **Completare l'integrazione dei microservizi:** Assicurarsi che il backend Node.js inoltri correttamente le richieste ai microservizi Python e che gestisca le risposte.
* **Implementare la visualizzazione dinamica dei risultati:**  In `ResultPage.js`, implementare la logica per visualizzare i risultati in modo diverso a seconda del tipo di test, utilizzando i dati restituiti dal microservizio Python.
* **Migliorare la gestione degli errori:**  Gestire gli errori in modo più specifico e informativo, sia nel frontend che nel backend.

### Funzionalità aggiuntive
* **Completare la Dashboard:**  Aggiungere altre sezioni come "Statistiche" o "Profilo".
* **Creare gli altri microservizi:**  Implementare i microservizi Python per gli altri tipi di test.
* **Aggiungere la generazione del PDF:**  Implementare la funzionalità per generare un PDF con i risultati del test.
* **Migliorare il design:**  Migliorare il design grafico dell'applicazione con CSS o una libreria di componenti UI.
* **Testare l'applicazione:**  Scrivere test automatici per il frontend e il backend.
* **Deployare l'applicazione:**  Deployare l'applicazione su un server di produzione.

## Tecnologie utilizzate
* **Frontend:** React, JavaScript, HTML, CSS, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Microservizi:** Python, Flask
* **Autenticazione:** JWT (JSON Web Token)
* **Controllo versione:** Git, GitHub

## Note
* Il progetto è in fase di sviluppo.
* La documentazione verrà aggiornata man mano che il progetto procede.


TO DO:
Completamento Backend:


Finalizzare l'integrazione del microservizio Python per l'elaborazione dei test
Implementare la logica di gestione delle classi e degli studenti
Aggiungere la funzionalità di import studenti da Excel
Implementare il sistema di generazione report PDF


Gestione Dati:


Strutturare correttamente il database per scuole/classi/studenti
Implementare query ottimizzate per i dati del dashboard
Aggiungere caching per migliorare le performance
Implementare backup automatici dei dati


Sicurezza e GDPR:


Rafforzare l'autenticazione (refresh token, password reset)
Implementare la gestione dei consensi GDPR
Aggiungere logging delle attività
Implementare la crittografia dei dati sensibili


Testing e Deploy:


Scrivere test unitari per backend e frontend
Configurare un ambiente di staging
Preparare il sistema per il deployment
Documentare l'API e le procedure di manutenzione