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

// Rimuovi tutti gli indici esistenti eccetto _id
classSchema.indexes().forEach(async (index) => {
    if (!index[0]._id) {
        await mongoose.model('Class').collection.dropIndex(index[0]);
    }
});

// Crea un nuovo indice con i nomi corretti
classSchema.index(
    { 
        schoolId: 1, 
        number: 1, 
        section: 1, 
        schoolYear: 1 
    }, 
    { 
        unique: true,
        name: 'class_unique_composite_index'
    }
);

const Class = mongoose.model('Class', classSchema);

module.exports = Class;