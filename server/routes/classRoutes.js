const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const classController = require('../controllers/classController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

// Validazioni per la classe
const classValidations = [
    body('numero')
        .notEmpty().withMessage('Il numero della classe è obbligatorio')
        .matches(/^[1-5]$/).withMessage('Il numero della classe deve essere tra 1 e 5'),
    body('sezione')
        .notEmpty().withMessage('La sezione è obbligatoria')
        .matches(/^[A-Z]$/).withMessage('La sezione deve essere una lettera maiuscola')
];

router.get('/', authMiddleware, classController.getClasses);
router.get('/:id', authMiddleware, classController.getClass);
router.post('/', authMiddleware, classValidations, validateRequest, classController.createClass);
router.put('/:id', authMiddleware, classValidations, validateRequest, classController.updateClass);
router.delete('/:id', authMiddleware, classController.deleteClass);

module.exports = router;