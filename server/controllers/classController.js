const Class = require('../models/Class');

exports.getClasses = async (req, res) => {
  try {
    console.log('getClasses chiamato');
    const classes = await Class.find();
    console.log('Classi trovate:', classes);
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Errore in getClasses:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle classi'
    });
  }
};

exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getClass = async (req, res) => {
  try {
    const classe = await Class.findById(req.params.id);
    if (!classe) {
      return res.status(404).json({
        success: false,
        error: 'Classe non trovata'
      });
    }
    res.json({
      success: true,
      data: classe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classe = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!classe) {
      return res.status(404).json({
        success: false,
        error: 'Classe non trovata'
      });
    }
    res.json({
      success: true,
      data: classe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classe = await Class.findByIdAndDelete(req.params.id);
    if (!classe) {
      return res.status(404).json({
        success: false,
        error: 'Classe non trovata'
      });
    }
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};