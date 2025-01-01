// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Il nome è obbligatorio'],
    trim: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'La scuola è obbligatoria']
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
}, {
  timestamps: true,
});

// Indici
studentSchema.index({ school: 1 });
studentSchema.index({ classe: 1, school: 1 });

// Virtual per nome completo
studentSchema.virtual('nomeCompleto').get(function() {
  return `${this.cognome} ${this.nome}`;
});

// Validazione batch migliorata
studentSchema.statics.validateBatch = async function(students, schoolConfig) {
  const errors = [];
  const validStudents = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    try {
      // Validazione campi obbligatori
      if (!student.nome || !student.cognome || !student.sesso || 
          !student.dataNascita || !student.classe) {
        errors.push(`Riga ${i + 1}: Dati obbligatori mancanti`);
        continue;
      }

      // Validazione classe
      const classeNum = parseInt(student.classe);
      const maxClasse = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
      if (isNaN(classeNum) || classeNum < 1 || classeNum > maxClasse) {
        errors.push(`Riga ${i + 1}: Classe non valida per questo tipo di istituto`);
        continue;
      }

      validStudents.push({
        ...student,
        dataNascita: new Date(student.dataNascita)
      });

    } catch (error) {
      errors.push(`Riga ${i + 1}: ${error.message}`);
    }
  }

  return { validStudents, errors };
};

// Middleware pre-save
studentSchema.pre('save', function(next) {
  // Gestione sesso
  if (this.sesso) {
    this.sesso = this.sesso.toUpperCase();
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;