const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const classController = require('../controllers/classController');

// Rimuovi tutte le definizioni di route duplicate e usa solo queste
router.get('/', authMiddleware, classController.getClasses);
router.get('/:id', authMiddleware, classController.getClass);
router.post('/', authMiddleware, classController.createClass);
router.put('/:id', authMiddleware, classController.updateClass);
router.delete('/:id', authMiddleware, classController.deleteClass);

module.exports = router;