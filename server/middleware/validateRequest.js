const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    // Recupera i risultati della validazione
    const errors = validationResult(req);
    
    // Se non ci sono errori, procedi
    if (errors.isEmpty()) {
        return next();
    }

    // Formatta gli errori in un oggetto più leggibile
    const formattedErrors = errors.array().reduce((acc, error) => {
        const field = error.path;
        if (!acc[field]) {
            acc[field] = [];
        }
        acc[field].push(error.msg);
        return acc;
    }, {});

    // Se ci sono errori, ritorna un 400 con gli errori formattati
    return res.status(400).json({
        success: false,
        message: 'Errori di validazione',
        errors: formattedErrors
    });
};

module.exports = {
    validateRequest
};