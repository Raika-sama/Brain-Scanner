// server/models/Test.js
// nome: Nome del test (es. "Stili Cognitivi").
// descrizione: Breve descrizione del test.
// domande: Array di oggetti, dove ogni oggetto rappresenta una domanda del test.
// testo: Testo della domanda.
// opzioni: Array di stringhe che rappresentano le opzioni di risposta.
// rispostaCorretta: (Opzionale) La risposta corretta alla domanda. Questo campo è utile per i test che hanno risposte giuste o sbagliate, come i test di conoscenza.


const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: true 
  },
  descrizione: { 
    type: String 
  },
  domande: [
    {
      testo: { 
        type: String, 
        required: true 
      },
      opzioni: [{ 
        type: String, 
        required: true 
      }], // Array di opzioni di risposta
      rispostaCorretta: { 
        type: String 
      } // Opzionale, se il test ha risposte corrette
    }
  ],
  // Altre informazioni sul test, come istruzioni, tempo limite, etc.
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;