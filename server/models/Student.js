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
    gender: {                     // Cambiato da 'sesso' a 'gender'
        type: String,
        enum: {
            values: ['M', 'F'],
            message: '{VALUE} non è un valore valido per il genere'
        },
        required: true,
        uppercase: true
    },
    number: {                     // Cambiato da 'classe' a 'number'
        type: Number,
        required: true,
        min: [1, 'La classe deve essere maggiore di 0'],
        max: [5, 'La classe non può essere maggiore di 5']
    },
    section: {                    // Cambiato da 'sezione' a 'section'
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    schoolYear: {                 // Cambiato da 'annoScolastico' a 'schoolYear'
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{4}\/\d{4}$/.test(v);
            },
            message: props => `${props.value} non è un formato valido per l'anno scolastico (es. 2023/2024)`
        }
    },
    schoolId: {                   // Cambiato da 'school' a 'schoolId'
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

// Indice composito unico
studentSchema.index({ 
    schoolId: 1, 
    number: 1, 
    section: 1, 
    schoolYear: 1,
    nome: 1,
    cognome: 1 
}, { 
    unique: true,
    name: "student_unique_composite_index"
});

// Indici aggiuntivi per performance
studentSchema.index({ schoolId: 1, number: 1, section: 1 });
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
    // Converti gender in maiuscolo
    if (this.gender) {
        this.gender = this.gender.toUpperCase();
    }
    next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;