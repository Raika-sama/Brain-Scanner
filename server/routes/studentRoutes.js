// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Route base esistenti
router.get('/', authMiddleware, studentController.getStudents);
router.get('/:id', authMiddleware, studentController.getStudent);
router.get('/:id/analysis', authMiddleware, studentController.getStudentAnalysis);
router.post('/', authMiddleware, studentController.createStudent);
router.put('/:id', authMiddleware, studentController.updateStudent);
router.delete('/:id', authMiddleware, studentController.deleteStudent);

// Rotta per l'importazione batch - utilizza il nuovo controller
router.post('/batch', authMiddleware, studentController.createBatchStudents);

module.exports = router;