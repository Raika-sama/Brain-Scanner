// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  cognome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  ruolo: {
    type: String,
    enum: ['studente', 'insegnante', 'amministratore', 'superadmin'], // Aggiungiamo superadmin
    default: 'studente',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'  // Riferimento al modello School
  },
  lastLogin: Date
}, { timestamps: true });

// Metodo virtuale per verificare se l'utente è admin
userSchema.virtual('isAdmin').get(function() {
  return this.ruolo === 'amministratore' || this.ruolo === 'superadmin';
});

// Metodo per verificare i permessi admin
userSchema.methods.hasAdminAccess = function() {
  return this.isAdmin;
};

// Metodo per verificare i permessi superadmin
userSchema.methods.isSuperAdmin = function() {
  return this.ruolo === 'superadmin';
};

// Assicurati che le proprietà virtuali siano incluse quando converti in JSON
userSchema.set('toJSON', {
  virtuals: true
});

userSchema.set('toObject', {
  virtuals: true
});

module.exports = mongoose.model('User', userSchema);