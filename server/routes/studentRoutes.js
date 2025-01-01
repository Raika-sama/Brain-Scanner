const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

// Validazioni comuni
const studentValidations = {
    nome: body('nome')
        .trim()
        .notEmpty().withMessage('Il nome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il nome deve essere di almeno 2 caratteri'),
    
    cognome: body('cognome')
        .trim()
        .notEmpty().withMessage('Il cognome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il cognome deve essere di almeno 2 caratteri'),
    
    sesso: body('sesso')
        .trim()
        .notEmpty().withMessage('Il sesso è obbligatorio')
        .isIn(['M', 'F']).withMessage('Il sesso deve essere M o F'),
    
    classe: body('classe')
        .optional()
        .isMongoId().withMessage('ID classe non valido')
};

// Validazioni per l'importazione batch
const batchValidations = [
    body('students')
        .isArray().withMessage('Il campo students deve essere un array')
        .notEmpty().withMessage('L\'array students non può essere vuoto'),
    
    body('students.*.nome')
        .trim()
        .notEmpty().withMessage('Il nome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il nome deve essere di almeno 2 caratteri'),
    
    body('students.*.cognome')
        .trim()
        .notEmpty().withMessage('Il cognome è obbligatorio')
        .isLength({ min: 2 }).withMessage('Il cognome deve essere di almeno 2 caratteri'),
    
    body('students.*.sesso')
        .trim()
        .notEmpty().withMessage('Il sesso è obbligatorio')
        .isIn(['M', 'F']).withMessage('Il sesso deve essere M o F'),
    
    body('students.*.classe')
        .notEmpty().withMessage('La classe è obbligatoria')
        .isString().withMessage('La classe deve essere una stringa')
        .matches(/^[1-5]$/).withMessage('La classe deve essere un numero da 1 a 5'),
    
    body('students.*.sezione')
        .notEmpty().withMessage('La sezione è obbligatoria')
        .isString().withMessage('La sezione deve essere una stringa')
        .matches(/^[A-Z]$/).withMessage('La sezione deve essere una lettera maiuscola')
];

// Rotte GET
router.get('/', 
    authMiddleware,
    [
        query('classe').optional().isMongoId().withMessage('ID classe non valido'),
        query('search').optional().trim()
    ],
    validateRequest,
    studentController.getStudents
);

router.get('/:id',
    authMiddleware,
    [
        param('id').isMongoId().withMessage('ID studente non valido')
    ],
    validateRequest,
    studentController.getStudent
);

router.get('/:id/analysis',
    authMiddleware,
    [
        param('id').isMongoId().withMessage('ID studente non valido')
    ],
    validateRequest,
    studentController.getStudentAnalysis
);

// Rotte POST
router.post('/',
    authMiddleware,
    [
        studentValidations.nome,
        studentValidations.cognome,
        studentValidations.sesso,
        studentValidations.classe
    ],
    validateRequest,
    studentController.createStudent
);

// Route per l'importazione studenti
router.post('/import',
    authMiddleware,
    [
        body('students').isArray().withMessage('È richiesto un array di studenti'),
        body('schoolId').isMongoId().withMessage('ID scuola non valido'),
        body('teacherId').isMongoId().withMessage('ID insegnante non valido')
    ],
    validateRequest,
    studentController.importStudents
);

router.post('/batch',
    authMiddleware,
    batchValidations,
    validateRequest,
    studentController.createBatchStudents
);

// Rotte PUT
router.put('/:id',
    authMiddleware,
    [
        param('id').isMongoId().withMessage('ID studente non valido'),
        studentValidations.nome,
        studentValidations.cognome,
        studentValidations.sesso,
        studentValidations.classe
    ],
    validateRequest,
    studentController.updateStudent
);

// Rotte DELETE
router.delete('/:id',
    authMiddleware,
    [
        param('id').isMongoId().withMessage('ID studente non valido')
    ],
    validateRequest,
    studentController.deleteStudent
);

module.exports = router;