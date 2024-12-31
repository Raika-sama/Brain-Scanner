const Student = require('../models/Student');
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');


// Route base per gli studenti
router.get('/', authMiddleware, studentController.getStudents);
router.get('/:id', authMiddleware, studentController.getStudent);
router.get('/:id/analysis', authMiddleware, studentController.getStudentAnalysis);
router.post('/', authMiddleware, studentController.createStudent);
router.put('/:id', authMiddleware, studentController.updateStudent);
router.delete('/:id', authMiddleware, studentController.deleteStudent);


module.exports = router;

