Brain-Scanner - Documentazione Database
Ultimo aggiornamento: 2025-01-02 14:10:06 UTC
Autore: Raika-sama
Repository: Brain-Scanner

🔍 Overview
Sistema di gestione scolastica implementato con MongoDB, focalizzato sulla gestione di classi e studenti. Il sistema mantiene relazioni tra scuole, classi, studenti e insegnanti.

📚 Struttura Database
Collection: Classes
JavaScript
{
  _id: ObjectId,              // Identificatore univoco della classe
  year: Number,              // Anno di corso (es: 1)
  section: String,           // Sezione (es: "A")
  academicYear: String,      // Anno accademico (formato: "2024/2025")
  schoolId: ObjectId,        // Riferimento alla scuola di appartenenza
  mainTeacher: ObjectId,     // Riferimento all'insegnante principale
  teachers: [ObjectId],      // Array degli insegnanti (include sempre mainTeacher)
  students: [ObjectId],      // Array degli studenti assegnati
  isActive: Boolean,         // Stato attività della classe
  createdAt: ISODate,        // Data creazione record
  updatedAt: ISODate         // Data ultimo aggiornamento
}
Collection: Students
JavaScript
{
  _id: ObjectId,              // Identificatore univoco dello studente
  firstName: String,          // Nome
  lastName: String,           // Cognome
  gender: String,            // Genere ("M"/"F")
  section: String,           // Sezione di appartenenza
  schoolId: ObjectId,        // Riferimento alla scuola
  classId: ObjectId,         // Riferimento alla classe
  mainTeacher: ObjectId,     // Riferimento all'insegnante principale
  teachers: [ObjectId],      // Array degli insegnanti (include sempre mainTeacher)
  notes: String,             // Note/Commenti sullo studente
  isActive: Boolean,         // Stato attività dello studente
  createdAt: ISODate,        // Data creazione record
  updatedAt: ISODate         // Data ultimo aggiornamento
}
🔗 Relazioni
Ogni classe ha un mainTeacher che è automaticamente incluso nell'array teachers
Ogni studente è associato a:
Una scuola (schoolId)
Una classe (classId)
Un insegnante principale (mainTeacher)
L'array teachers dello studente include sempre il mainTeacher
🚨 Vincoli Importanti
Una classe deve sempre avere un mainTeacher
L'array teachers non può essere vuoto e deve contenere almeno il mainTeacher
Tutti i documenti mantengono traccia delle date di creazione e aggiornamento
Il campo isActive gestisce lo stato attivo/inattivo dei record
📖 Esempi di Query Comuni
JavaScript
// Trovare tutti gli studenti di una classe
db.students.find({ classId: ObjectId('class_id') })

// Trovare tutte le classi di un insegnante
db.classes.find({ teachers: ObjectId('teacher_id') })

// Trovare studenti attivi per una sezione
db.students.find({ section: "A", isActive: true })
🔄 Aggiornamenti Automatici
createdAt: Impostato automaticamente alla creazione del documento
updatedAt: Aggiornato automaticamente ad ogni modifica
teachers: Array aggiornato automaticamente per includere il mainTeacher
📝 Note per lo Sviluppo
Utilizzare sempre gli ObjectId per i riferimenti tra collezioni
Mantenere la coerenza dei dati tra mainTeacher e array teachers
Verificare sempre lo stato isActive quando si recuperano i record
Utilizzare gli indici appropriati per ottimizzare le query frequenti
🛠 Tech Stack
Database: MongoDB
Linguaggio Principale: Python (98.3%)
Altri linguaggi: JavaScript (1.5%), PowerShell (0.2%)
🔐 Best Practices
Utilizzare sempre transazioni per operazioni che coinvolgono più collezioni
Validare i dati prima dell'inserimento
Mantenere la consistenza delle relazioni tra documenti
Aggiornare sempre i timestamp quando si modificano i documenti

Sviluppo Features:

Implementazione di nuove funzionalità
Miglioramento di funzionalità esistenti
Testing:

Creazione di test unitari per il nuovo schema
Validazione delle relazioni tra collections
Documentazione:

Aggiornamento della documentazione API
Creazione di guide per gli sviluppatori
Ottimizzazione:

Creazione di indici per migliorare le performance
Analisi delle query più frequenti