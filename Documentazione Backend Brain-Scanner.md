Documentazione Backend Brain-Scanner
Ultimo aggiornamento: 2025-01-02 14:29:42 UTC
Autore: Raika-sama
Repository: Brain-Scanner

🏗️ Architettura Backend
1. Stack Tecnologico
Database: MongoDB
Server: Node.js con Express.js
Autenticazione: JWT (JSON Web Tokens)
Pattern: MVC con Service Layer
2. Struttura del Progetto
Code
server/
├── controllers/          # Gestione delle richieste HTTP
├── models/              # Schema del database
├── routes/              # Definizione delle rotte API
├── services/           # Logica di business
├── middleware/         # Middleware personalizzati
└── config/            # Configurazioni
3. Componenti Principali
3.1 Models
Classes: Gestione delle classi scolastiche
Students: Gestione degli studenti
Users: Gestione utenti e autenticazione
Schools: Gestione delle scuole
3.2 Controllers
JavaScript
// Pattern comune dei controller
const entityController = {
    getAll: async (req, res) => { ... },
    getOne: async (req, res) => { ... },
    create: async (req, res) => { ... },
    update: async (req, res) => { ... },
    delete: async (req, res) => { ... }
};
3.3 Routes
JavaScript
// Pattern comune delle routes
router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getOne);
router.post('/', [authMiddleware, validateRequest], controller.create);
router.put('/:id', [authMiddleware, validateRequest], controller.update);
router.delete('/:id', authMiddleware, controller.delete);
3.4 Services
JavaScript
// Pattern comune dei services
class EntityService {
    static async businessLogicMethod() { ... }
    static getCurrentSchoolYear() { ... }
    static async canModifyEntity() { ... }
}
4. Flusso delle Richieste
Client → Invia richiesta HTTP
Middleware → Verifica autenticazione e validazione
Routes → Instrada la richiesta al controller appropriato
Controller → Gestisce la richiesta e utilizza i Services
Services → Esegue la logica di business
Models → Interagisce con il database
Response → Ritorna al client
5. Sicurezza
5.1 Autenticazione
JWT per gestire le sessioni
Token storage sicuro
Refresh token non implementato
5.2 Autorizzazione
JavaScript
// Esempio di controllo permessi
$or: [
    { mainTeacher: userId },
    { teachers: userId }
]
5.3 Validazione
Validazione input con express-validator
Sanitizzazione dati
Gestione errori centralizzata
6. Gestione Transazioni
JavaScript
const session = await mongoose.startSession();
session.startTransaction();
try {
    // Operazioni nel database
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
7. Pattern Comuni
7.1 Soft Delete
JavaScript
// Invece di eliminare il record
entity.isActive = false;
await entity.save();
7.2 Popolazione Relazioni
JavaScript
await Entity.findById(id)
    .populate('relationField', 'selectedFields')
    .populate('anotherRelation');
8. Risposte API
JavaScript
// Formato standard risposta successo
{
    success: true,
    data: result,
    message: "Operazione completata"
}

// Formato standard risposta errore
{
    success: false,
    message: "Descrizione errore"
}
9. Best Practices
Utilizzare sempre le transazioni per operazioni multiple
Validare input prima di ogni operazione
Gestire correttamente le relazioni tra entità
Mantenere la consistenza dei dati
Utilizzare i Services per la logica di business complessa
10. Limitazioni Attuali
Nessun sistema di caching
Rate limiting base
Logging system minimale
Nessuna gestione refresh token
📝 Note per gli Sviluppatori
Seguire il pattern esistente per nuove implementazioni
Utilizzare i Services per logica complessa
Mantenere la consistenza nelle risposte API
Documentare accuratamente nuovo codice
Testare le transazioni con casi limite
🔄 Workflow Tipico
Validazione richiesta
Autenticazione utente
Verifica permessi
Esecuzione logica business
Gestione transazioni
Formattazione risposta