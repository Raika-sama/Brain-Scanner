// server/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    sezione: {
        type: String,
        required: true
    },
    annoScolastico: {
        type: String,
        required: true
    },
    scuola: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    studenti: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    docenti: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Class', classSchema);