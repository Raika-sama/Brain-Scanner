const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

// Validazioni base per studente
const studentValidations = [
    body('nome')
        .trim()
        .notEmpty().withMessage('Il nome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il nome deve essere di almeno 2 caratteri'),
    
    body('cognome')
        .trim()
        .notEmpty().withMessage('Il cognome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il cognome deve essere di almeno 2 caratteri'),
    
    body('gender')
        .trim()
        .notEmpty().withMessage('Il genere è obbligatorio')
        .isIn(['M', 'F']).withMessage('Il genere deve essere M o F'),
    
    body('number')
        .notEmpty().withMessage('Il numero della classe è obbligatorio')
        .isInt({ min: 1, max: 5 }).withMessage('Il numero della classe deve essere tra 1 e 5'),
    
    body('section')
        .notEmpty().withMessage('La sezione è obbligatoria')
        .matches(/^[A-Z]$/).withMessage('La sezione deve essere una lettera maiuscola'),
    
    // Note è opzionale
    body('note')
        .optional()
        .trim()
        .isString().withMessage('Le note devono essere una stringa')
];

// Validazioni per ricerca e filtri
const searchValidations = [
    query('number').optional().isInt({ min: 1, max: 5 })
        .withMessage('Il numero della classe deve essere tra 1 e 5'),
    query('section').optional().matches(/^[A-Z]$/)
        .withMessage('La sezione deve essere una lettera maiuscola'),
    query('search').optional().trim()
];

// Validazione ID
const idValidation = param('id').isMongoId().withMessage('ID studente non valido');

// Validazioni per la gestione dei teacher
const teacherValidations = [
    body('teacherId')
        .notEmpty().withMessage('ID teacher obbligatorio')
        .isMongoId().withMessage('ID teacher non valido')
];

// Routes principali
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

// Nuove route per la gestione dei teacher
router.post('/:id/teachers', 
    authMiddleware, 
    [idValidation, ...teacherValidations], 
    validateRequest,
    studentController.addTeacher
);

router.delete('/:id/teachers/:teacherId', 
    authMiddleware, 
    [
        idValidation,
        param('teacherId').isMongoId().withMessage('ID teacher non valido')
    ], 
    validateRequest,
    studentController.removeTeacher
);

module.exports = router;