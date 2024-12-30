// server/models/Result.js
// utente: Riferimento all'utente che ha effettuato il test.
// test: Riferimento al test effettuato.
// risposte: Array di oggetti, dove ogni oggetto rappresenta una risposta dell'utente.
// domanda: Numero della domanda.
// risposta: Risposta data dall'utente.
// punteggio: Punteggio totale del test (se applicabile).
// data: Data e ora di completamento del test.



const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  utente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Riferimento all'utente che ha effettuato il test
  test: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test', 
    required: true 
  }, // Riferimento al test effettuato
  risposte: [{ 
    domanda: { 
      type: Number, 
      required: true 
    }, 
    risposta: { 
      type: String, 
      required: true 
    } 
  }], // Array di risposte dell'utente
  punteggio: { 
    type: Number 
  }, // Punteggio totale del test (se applicabile)
  data: { 
    type: Date, 
    default: Date.now 
  } // Data e ora di completamento del test
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;