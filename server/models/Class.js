const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    number: {  
        type: Number,
        required: [true, 'Il numero della classe è obbligatorio'],
        min: [1, 'Il numero della classe deve essere almeno 1'],
        max: [5, 'Il numero della classe non può essere maggiore di 5']
    },
    section: {
        type: String,
        required: [true, 'La sezione è obbligatoria'],
        trim: true,
        uppercase: true
    },
    schoolYear: {
        type: String,
        required: [true, "L'anno scolastico è obbligatorio"],
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
        required: [true, 'Il riferimento alla scuola è obbligatorio']
    },
    // Aggiungiamo il teacher principale
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Il teacher principale è obbligatorio']
    },
    specialization: {
        type: String,
        required: false
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Aggiorniamo gli indici per includere teacherId
classSchema.index(
    { 
        schoolId: 1, 
        number: 1, 
        section: 1, 
        schoolYear: 1,
        teacherId: 1 
    }, 
    { 
        unique: true,
        name: 'class_unique_composite_index'
    }
);

// Aggiungiamo un indice per le query per teacher
classSchema.index({ teacherId: 1 });
classSchema.index({ teachers: 1 });

// Middleware per assicurarsi che il teacherId sia sempre nei teachers
classSchema.pre('save', function(next) {
    if (this.teacherId && !this.teachers.includes(this.teacherId)) {
        this.teachers.push(this.teacherId);
    }
    next();
});

// Method per aggiungere un teacher
classSchema.methods.addTeacher = function(teacherId) {
    if (!this.teachers.includes(teacherId)) {
        this.teachers.push(teacherId);
    }
    return this;
};

// Method per rimuovere un teacher (non permettiamo la rimozione del teacherId principale)
classSchema.methods.removeTeacher = function(teacherId) {
    if (teacherId.equals(this.teacherId)) {
        throw new Error('Non puoi rimuovere il teacher principale');
    }
    this.teachers = this.teachers.filter(id => !id.equals(teacherId));
    return this;
};

const Class = mongoose.model('Class', classSchema);

module.exports = Class;