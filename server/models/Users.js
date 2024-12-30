// server/models/User.js
//mongoose.Schema: Definisce la struttura del documento utente nel database.
//nome, cognome, email, password: Campi stringa obbligatori.
//email: Deve essere univoca, per evitare utenti duplicati.
//ruolo: Campo stringa che definisce il ruolo dell'utente. Può assumere solo i valori studente, insegnante o amministratore. Il valore di default è studente.
//mongoose.model: Crea un modello Mongoose chiamato User basato sullo schema userSchema.
//module.exports: Esporta il modello User in modo che possa essere utilizzato in altri file.

const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  cognome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  ruolo: {
    type: String,
    enum: ['studente', 'insegnante', 'amministratore'], // Definisce i ruoli possibili
    default: 'studente'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'  // Riferimento al modello School
  }
}, { timestamps: true});

module.exports = mongoose.model('User', userSchema);


