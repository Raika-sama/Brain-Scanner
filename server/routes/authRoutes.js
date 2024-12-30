const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const util = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authMiddleware, loginLimiter } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const secretKey = process.env.JWT_SECRET;

if(!secretKey){
    throw new Error("JWT_SECRET environment variable not defined.");
}

// Promisify scrypt e randomBytes
const scrypt = util.promisify(crypto.scrypt);
const randomBytes = util.promisify(crypto.randomBytes);

// Aggiungi queste funzioni di utility per l'hashing
async function hashPassword(password) {
    const salt = (await randomBytes(16)).toString('hex');
    const derivedKey = await scrypt(password, salt, 64);
    return `${salt}.${derivedKey.toString('hex')}`;
}

async function verifyPassword(storedPassword, suppliedPassword) {
    const [salt, hash] = storedPassword.split('.');
    const hashedBuffer = await scrypt(suppliedPassword, salt, 64);
    const keyBuffer = Buffer.from(hash, 'hex');
    const hashBuffer = Buffer.from(hashedBuffer);
    return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

router.post('/register', async (req, res) => {
  try {
    console.log('Ricevuta richiesta di registrazione:', req.body);
    const { nome, cognome, email, password, ruolo } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email già registrata.' 
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ 
      nome, 
      cognome, 
      email, 
      password: hashedPassword,
      ruolo 
    });

    await newUser.save();

    const token = jwt.sign(
      { 
        userId: newUser._id,
        email: newUser.email,
        ruolo: newUser.ruolo
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '24h'
      }
    );

    return res.status(201).json({ 
      success: true,
      message: 'Utente registrato con successo!', 
      token,
      user: {
        nome: newUser.nome,
        cognome: newUser.cognome,
        email: newUser.email,
        ruolo: newUser.ruolo
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Errore durante la registrazione.' 
    });
  }
});

// Aggiungi il loginLimiter come middleware alla route login
router.post('/login', async (req, res) => {
  console.log('Login route hit - body:', req.body);
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', {email, mongoConnection: mongoose.connection.readyState});
    
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }

    const isMatch = await verifyPassword(user.password, password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      ruolo: user.ruolo,
      scuola: user.scuola  // Usa 'scuola' invece di 'school'
  }, process.env.JWT_SECRET, {
      expiresIn: '24h'
  });

    console.log('Login riuscito per utente:', email);

    return res.json({ 
      success: true,
      message: 'Login effettuato con successo!',
      token,
      user: {
        _id: user._id,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
        scuola: user.scuola
      }
    });

  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ success: false, message: 'Errore durante il login' });
  }
});

module.exports = router;