const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

// Validazioni base per studente singolo
const studentValidations = [
    body('nome')
        .trim()
        .notEmpty().withMessage('Il nome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il nome deve essere di almeno 2 caratteri'),
    
    body('cognome')
        .trim()
        .notEmpty().withMessage('Il cognome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il cognome deve essere di almeno 2 caratteri'),
    
    body('sesso')
        .trim()
        .notEmpty().withMessage('Il sesso è obbligatorio')
        .isIn(['M', 'F']).withMessage('Il sesso deve essere M o F'),
    
    body('classe')
        .notEmpty().withMessage('La classe è obbligatoria')
        .isString().withMessage('La classe deve essere una stringa')
        .matches(/^[1-5]$/).withMessage('La classe deve essere un numero da 1 a 5'),
    
    body('sezione')
        .notEmpty().withMessage('La sezione è obbligatoria')
        .isString().withMessage('La sezione deve essere una stringa')
        .matches(/^[A-Z]$/).withMessage('La sezione deve essere una lettera maiuscola')
];

// Validazioni per ricerca e filtri
const searchValidations = [
    query('classe').optional().trim(),
    query('sezione').optional().trim(),
    query('search').optional().trim()
];

// Validazione ID
const idValidation = param('id').isMongoId().withMessage('ID non valido');

// Definizione delle routes
router.get('/', 
    authMiddleware,
    searchValidations,
    validateRequest,
    studentController.getStudents
);

router.get('/:id',
    authMiddleware,
    [idValidation],
    validateRequest,
    studentController.getStudent
);

router.post('/',
    authMiddleware,
    studentValidations,
    validateRequest,
    studentController.createStudent
);

router.put('/:id',
    authMiddleware,
    [idValidation, ...studentValidations],
    validateRequest,
    studentController.updateStudent
);

router.delete('/:id',
    authMiddleware,
    [idValidation],
    validateRequest,
    studentController.deleteStudent
);

module.exports = router;