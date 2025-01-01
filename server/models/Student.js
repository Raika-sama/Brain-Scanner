// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome è obbligatorio'],
    trim: true // Rimuove gli spazi bianchi all'inizio e alla fine
  },
  cognome: {
    type: String,
    required: [true, 'Il cognome è obbligatorio'],
    trim: true
  },
  sesso: {
    type: String,
    enum: {
      values: ['M', 'F'],
      message: '{VALUE} non è un valore valido per il sesso'
    },
    required: true
  },
  dataNascita: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'La data di nascita non può essere nel futuro'
    }
  },
  classe: {
    type: String,
    required: true,
    trim: true,
    uppercase: true // Converte automaticamente in maiuscolo
  },
  sezione: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  indirizzo: {
    type: String,
    required: false,
    trim: true
  },
  codiceFiscale: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Validazione base del codice fiscale (16 caratteri)
        // Modifichiamo il validatore per accettare anche valori vuoti
        if (!v) return true;
        return /^[A-Z0-9]{16}$/.test(v);
      },
      message: 'Il codice fiscale deve essere di 16 caratteri alfanumerici'
    }
  },
  note: {
    type: String,
    trim: true,
    default: '' // Valore di default per le note vuote
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'La scuola è obbligatoria']
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Corretto il typo da 'USer' a 'User'
  }]
}, {
  timestamps: true,
});

// Indici per migliorare le performance delle query

studentSchema.index({ school: 1 });
studentSchema.index({ classe: 1, sezione: 1, school: 1 });

// Metodo virtuale per ottenere il nome completo
studentSchema.virtual('nomeCompleto').get(function() {
  return `${this.cognome} ${this.nome}`;
});


// AGGIUNGI QUI IL NUOVO METODO DI VALIDAZIONE BATCH
studentSchema.statics.validateBatch = async function(students, schoolConfig) {
    const errors = [];
    const validStudents = [];
  
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      try {
        // Validazione base
        if (!student.nome || !student.cognome || !student.sesso || 
            !student.dataNascita || !student.classe || !student.sezione) {
          errors.push(`Riga ${i + 1}: Dati obbligatori mancanti`);
          continue;
        }
  
        // Validazione classe in base al tipo di istituto
        const classeNum = parseInt(student.classe);
        const maxClasse = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
        if (isNaN(classeNum) || classeNum < 1 || classeNum > maxClasse) {
          errors.push(`Riga ${i + 1}: Classe non valida per questo tipo di istituto`);
          continue;
        }
  
        // Validazione sezione
        if (!schoolConfig.sezioni_disponibili.includes(student.sezione)) {
          errors.push(`Riga ${i + 1}: Sezione non valida per questa scuola`);
          continue;
        }
  
        // Validazione codice fiscale se presente
        if (student.codiceFiscale) {
          if (!/^[A-Z0-9]{16}$/.test(student.codiceFiscale.toUpperCase())) {
            errors.push(`Riga ${i + 1}: Codice fiscale non valido`);
            continue;
          }
          // Verifica duplicati
          const existingStudent = await this.findOne({ codiceFiscale: student.codiceFiscale.toUpperCase() });
          if (existingStudent) {
            errors.push(`Riga ${i + 1}: Codice fiscale già presente nel database`);
            continue;
          }
        }
  
        validStudents.push({
          ...student,
          codiceFiscale: student.codiceFiscale?.toUpperCase(),
          dataNascita: new Date(student.dataNascita)
        });
  
      } catch (error) {
        errors.push(`Riga ${i + 1}: ${error.message}`);
      }
    }
  
    return { validStudents, errors };
  };
  
  // Middleware pre-save per la formattazione
  studentSchema.pre('save', function(next) {
    this.codiceFiscale = this.codiceFiscale?.toUpperCase();
    next();
  });
  
  // ... (il resto del codice rimane invariato)
  
  const Student = mongoose.model('Student', studentSchema);
  
  module.exports = Student;