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
    gender: {
        type: String,
        enum: {
            values: ['M', 'F'],
            message: '{VALUE} non è un valore valido per il genere'
        },
        required: true,
        uppercase: true
    },
    number: {
        type: Number,
        required: true,
        min: [1, 'La classe deve essere maggiore di 0'],
        max: [5, 'La classe non può essere maggiore di 5']
    },
    section: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    schoolYear: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: props => `${props.value} non è un formato valido per l'anno scolastico (es. 2023/2024)`
        }
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'La scuola è obbligatoria']
    },
    // Aggiungiamo il teacher principale
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Il teacher principale è obbligatorio']
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

// Aggiorniamo l'indice composito
studentSchema.index({ 
    schoolId: 1, 
    number: 1, 
    section: 1, 
    schoolYear: 1,
    nome: 1,
    cognome: 1,
    teacherId: 1
}, { 
    unique: true,
    name: "student_unique_composite_index"
});

// Indici per performance
studentSchema.index({ schoolId: 1, number: 1, section: 1 });
studentSchema.index({ teacherId: 1 });
studentSchema.index({ teachers: 1 });

// Middleware per assicurare che teacherId sia sempre in teachers
studentSchema.pre('save', function(next) {
    // Converti gender in maiuscolo
    if (this.gender) {
        this.gender = this.gender.toUpperCase();
    }
    
    // Assicura che teacherId sia in teachers
    if (this.teacherId && !this.teachers.includes(this.teacherId)) {
        this.teachers.push(this.teacherId);
    }
    next();
});

// Methods
studentSchema.methods.addTeacher = function(teacherId) {
    if (!this.teachers.includes(teacherId)) {
        this.teachers.push(teacherId);
    }
    return this;
};

studentSchema.methods.removeTeacher = function(teacherId) {
    if (teacherId.equals(this.teacherId)) {
        throw new Error('Non puoi rimuovere il teacher principale');
    }
    this.teachers = this.teachers.filter(id => !id.equals(teacherId));
    return this;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;