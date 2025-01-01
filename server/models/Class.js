const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {  // Cambiato da 'nome' a 'numero'
        type: String,
        required: [true, 'Il numero della classe è obbligatorio'],
        trim: true
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
    schoolId: {  // Cambiato da 'scuola' a 'school'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'Il riferimento alla scuola è obbligatorio']
    },
    specialization: {          // nuovo campo
        type: String,
        required: false
    },
    students: [{  // Cambiato da 'studenti' a 'students'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    teachers: [{  // Cambiato da 'docenti' a 'teachers'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Aggiornato l'indice con i nuovi nomi dei campi
classSchema.index({ schoolId: 1, name: 1, section: 1, schoolYear: 1 }, { unique: true });
classSchema.index({ schoolId: 1 });

classSchema.virtual('fullName').get(function() {
    return `${this.name}${this.section}`;
});


// Aggiornato il metodo con il nuovo nome del campo
classSchema.methods.hasStudent = function(studentId) {
    return this.students.includes(studentId);
};

// Aggiornato il metodo con il nuovo nome del campo
classSchema.methods.addStudent = function(studentId) {
    if (!this.hasStudent(studentId)) {
        this.students.push(studentId);
    }
    return this;
};

// Aggiornato il virtual con il nuovo nome del campo
classSchema.virtual('nomeCompleto').get(function() {
    return `${this.numero}${this.sezione}`;
});

// Middleware pre-save rimane invariato
classSchema.pre('save', function(next) {
    if (this.sezione) {
        this.sezione = this.sezione.toUpperCase();
    }
    next();
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;