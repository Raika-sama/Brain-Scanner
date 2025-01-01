// server/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Il nome della classe è obbligatorio'],
        trim: true
    },
    sezione: {
        type: String,
        required: [true, 'La sezione è obbligatoria'],
        trim: true,
        uppercase: true
    },
    annoScolastico: {
        type: String,
        required: [true, "L'anno scolastico è obbligatorio"],
        validate: {
            validator: function(v) {
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: props => `${props.value} non è un formato valido per l'anno scolastico (es. 2023/2024)`
        }
    },
    scuola: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'Il riferimento alla scuola è obbligatorio']
    },
    studenti: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'  // Cambiato da 'User' a 'Student'
    }],
    docenti: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,  // Aggiunge createdAt e updatedAt
});

// Indici per migliorare le performance delle query
classSchema.index({ scuola: 1, nome: 1, sezione: 1, annoScolastico: 1 }, { unique: true });
classSchema.index({ scuola: 1 });

// Metodo per verificare se uno studente è già presente nella classe
classSchema.methods.hasStudent = function(studentId) {
    return this.studenti.includes(studentId);
};

// Metodo per aggiungere uno studente evitando duplicati
classSchema.methods.addStudent = function(studentId) {
    if (!this.hasStudent(studentId)) {
        this.studenti.push(studentId);
    }
    return this;
};

// Virtual per il nome completo della classe (es. "1A")
classSchema.virtual('nomeCompleto').get(function() {
    return `${this.nome}${this.sezione}`;
});

// Middleware pre-save per validazioni aggiuntive
classSchema.pre('save', function(next) {
    // Converti la sezione in maiuscolo
    if (this.sezione) {
        this.sezione = this.sezione.toUpperCase();
    }
    next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;