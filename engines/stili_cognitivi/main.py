# engines/stili_cognitivi/main.py
from flask import Flask, request, jsonify
import json
from datetime import datetime
import os
import sys
import logging
from werkzeug.middleware.proxy_fix import ProxyFix

# Aggiungi il percorso della cartella engines al PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import corretti
from shared.config import Config, config_by_name
from shared.logger import setup_logger, log_request, log_response, log_error
from shared.auth import token_required
from .validators import validate_test_input, validate_user_permissions
from .calculator import ProfileCalculator
from shared.models import TestInput, TestOutput, ProfiloCompleto

# Verifica delle variabili d'ambiente necessarie
if not os.environ.get('JWT_SECRET'):
    raise ValueError("JWT_SECRET environment variable not set")

if not os.environ.get('FLASK_ENV'):
    os.environ['FLASK_ENV'] = 'dev'

# Inizializzazione Flask e componenti
app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Setup logger
logger = setup_logger()
calculator = ProfileCalculator()

# Configurazione dell'ambiente
env = os.getenv('FLASK_ENV', 'dev')
app.config.from_object(config_by_name[env])

@app.before_request
def before_request():
    """Log della richiesta in arrivo"""
    if request.path != '/health':  # Ignora health checks
        logger.info(f'Richiesta ricevuta: {request.method} {request.path}')

@app.after_request
def after_request(response):
    """Log della risposta in uscita"""
    if request.path != '/health':  # Ignora health checks
        logger.info(f'Risposta inviata: Status {response.status_code}')
    return response

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint per verificare che il servizio sia attivo"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'stili_cognitivi',
        'version': '1.0'
    })

@app.route('/calculate', methods=['POST'])
@token_required
@validate_test_input
@validate_user_permissions(['studente', 'insegnante'])
def calculate(current_user):
    """Endpoint principale per il calcolo del profilo"""
    try:
        # Log della richiesta
        log_request(logger, request.validated_data, current_user)

        # Creiamo l'oggetto TestInput dai dati validati
        test_input = TestInput(
            user_id=current_user['user_id'],
            test_id=request.validated_data['test_id'],
            risposte=request.validated_data['risposte']
        )

        # Calcoliamo il profilo
        result = calculator.calculate_profile(test_input.risposte)

        # Creiamo il profilo completo
        profile = ProfiloCompleto(
            user_id=test_input.user_id,
            test_id=test_input.test_id,
            data=datetime.now(),
            profilo=result['profilo'],
            punteggio_totale=result['punteggio_totale'],
            media_punteggio=result['media_punteggio']
        )

        # Preparariamo la risposta
        response = TestOutput(
            success=True,
            message="Profilo calcolato con successo",
            data=profile
        )

        # Log della risposta
        log_response(logger, response)

        return jsonify(response.__dict__)

    except Exception as e:
        error_msg = f"Errore durante il calcolo del profilo: {str(e)}"
        log_error(logger, error_msg, exc_info=True)
        
        return jsonify(TestOutput(
            success=False,
            message="Errore durante l'elaborazione",
            errors={'detail': str(e)}
        ).__dict__), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    host = '0.0.0.0' if env == 'prod' else 'localhost'
    
    logger.info(f'Avvio del servizio stili_cognitivi su {host}:{port} in modalità {env}')
    
    app.run(
        host=host,
        port=port,
        debug=env == 'dev'
    )