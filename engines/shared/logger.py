# engines/shared/logger.py

import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime

def setup_logger():
    """Configura e restituisce un logger per il microservizio."""
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    log_filename = os.path.join(
        log_dir, 
        f'stili_cognitivi_{datetime.now().strftime("%Y%m%d")}.log'
    )

    logger = logging.getLogger('stili_cognitivi')
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    file_handler = RotatingFileHandler(
        log_filename,
        maxBytes=1024 * 1024,
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger

def log_request(logger, data, user_info=None):
    """Log dei dati della richiesta con info utente opzionale"""
    user_str = f" - User: {user_info['email']}" if user_info else ""
    logger.info(f"Nuova richiesta ricevuta{user_str} - Data: {data}")

def log_response(logger, response):
    """Log della risposta"""
    logger.info(f"Risposta inviata: {response}")

def log_error(logger, error_msg, exc_info=None):
    """Log degli errori"""
    logger.error(f"Errore: {error_msg}", exc_info=exc_info)

def log_validation_error(logger, error_details):
    """Log degli errori di validazione"""
    logger.warning(f"Errore di validazione: {error_details}")