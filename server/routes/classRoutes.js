const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const classController = require('../controllers/classController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

// Validazioni per la classe
const classValidations = [
    body('year')
        .notEmpty().withMessage('Il numero della classe è obbligatorio')
        .isInt({ min: 1, max: 5 }).withMessage('Il numero della classe deve essere tra 1 e 5'),
    
    body('section')
        .notEmpty().withMessage('La sezione è obbligatoria')
        .matches(/^[A-Z]$/).withMessage('La sezione deve essere una lettera maiuscola'),
    
    body('schoolId')
        .notEmpty().withMessage('ID scuola obbligatorio')
        .isMongoId().withMessage('ID scuola non valido'),
    
        body('academicYear')  // aggiunto
        .notEmpty().withMessage('Anno accademico obbligatorio')
        .matches(/^\d{4}\/\d{4}$/).withMessage('Formato anno accademico non valido (es: 2024/2025)'),
    
    body('mainTeacher')   // aggiunto
        .notEmpty().withMessage('Insegnante principale obbligatorio')
        .isMongoId().withMessage('ID insegnante non valido'),
    
    // Non includiamo teacherId nelle validazioni perché viene gestito automaticamente dal controller
];

// Validazione per l'ID nelle route parametriche
const idValidation = param('id').isMongoId().withMessage('ID classe non valido');

// Route per gestire i teacher
const teacherValidations = [
    body('teacherId')
        .notEmpty().withMessage('ID teacher obbligatorio')
        .isMongoId().withMessage('ID teacher non valido')
];

// Routes principali
router.get('/', authMiddleware, classController.getClasses);
router.get('/:id', authMiddleware, [idValidation], validateRequest, classController.getClass);
router.post('/', authMiddleware, classValidations, validateRequest, classController.createClass);
router.put('/:id', authMiddleware, [idValidation, ...classValidations], validateRequest, classController.updateClass);
router.delete('/:id', authMiddleware, [idValidation], validateRequest, classController.deleteClass);

// Nuove route per la gestione dei teacher
router.post('/:id/teachers', 
    authMiddleware, 
    [idValidation, ...teacherValidations], 
    validateRequest,
    classController.addTeacher
);

router.delete('/:id/teachers/:teacherId', 
    authMiddleware, 
    [
        idValidation,
        param('teacherId').isMongoId().withMessage('ID teacher non valido')
    ], 
    validateRequest,
    classController.removeTeacher
);

module.exports = router;