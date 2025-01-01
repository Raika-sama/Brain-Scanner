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
    classe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'La scuola è obbligatoria']
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    note: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Indici
studentSchema.index({ school: 1, classe: 1 });
studentSchema.index({ teachers: 1 });

// Methods
studentSchema.methods.addTeacher = function(teacherId) {
    if (!this.teachers.includes(teacherId)) {
        this.teachers.push(teacherId);
    }
    return this;
};

studentSchema.methods.removeTeacher = function(teacherId) {
    this.teachers = this.teachers.filter(id => !id.equals(teacherId));
    return this;
};

// Middleware
studentSchema.pre('save', function(next) {
    if (this.isNew && this.teachers.length === 0) {
        // Se è un nuovo studente e non ha teachers, aggiungi l'utente corrente
        // Questo andrà gestito nel controller usando req.user._id
        next(new Error('Almeno un insegnante deve essere associato'));
    }
    // Converti sesso in maiuscolo
    if (this.sesso) {
        this.sesso = this.sesso.toUpperCase();
    }
    next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;