const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const classController = require('../controllers/classController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

// Validazioni per la classe
const classValidations = [
    body('number')
        .notEmpty().withMessage('Il numero della classe è obbligatorio')
        .isInt({ min: 1, max: 5 }).withMessage('Il numero della classe deve essere tra 1 e 5'),
    body('section')
        .notEmpty().withMessage('La sezione è obbligatoria')
        .matches(/^[A-Z]$/).withMessage('La sezione deve essere una lettera maiuscola'),
    body('schoolId')
        .notEmpty().withMessage('ID scuola obbligatorio')
        .isMongoId().withMessage('ID scuola non valido')
];

router.get('/', authMiddleware, classController.getClasses);
router.get('/:id', authMiddleware, classController.getClass);
router.post('/', authMiddleware, classValidations, validateRequest, classController.createClass);
router.put('/:id', authMiddleware, classValidations, validateRequest, classController.updateClass);
router.delete('/:id', authMiddleware, classController.deleteClass);

module.exports = router;