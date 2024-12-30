# engines/shared/auth.py

import jwt
from functools import wraps
from flask import request, jsonify
from shared.config import Config
import logging

logger = logging.getLogger('stili_cognitivi')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        # Validazione header Authorization
        if not auth_header:
            logger.warning('Token mancante nell\'header Authorization')
            return jsonify({
                'success': False,
                'message': 'Token di autenticazione richiesto',
                'error': 'missing_token'
            }), 401

        try:
            # Estrazione e validazione del formato Bearer token
            if not auth_header.startswith('Bearer '):
                logger.warning('Token non in formato Bearer')
                raise jwt.InvalidTokenError('Invalid token format')
            
            token = auth_header.split(' ')[1]
            
            # Decodifica e verifica del token
            payload = jwt.decode(
                token,
                Config.JWT_SECRET_KEY,
                algorithms=["HS256"]
            )
            
            # Validazione dei claims necessari
            required_claims = ['userId', 'email', 'ruolo']
            if not all(claim in payload for claim in required_claims):
                logger.error(f'Token mancante di claims necessari: {required_claims}')
                raise jwt.InvalidTokenError('Missing required claims')

            # Creazione dell'oggetto current_user
            current_user = {
                'user_id': payload['userId'],
                'email': payload['email'],
                'ruolo': payload['ruolo']
            }
            
            logger.info(f'Autenticazione riuscita per utente: {current_user["email"]}')
            
            # Passa l'utente alla funzione decorata
            return f(current_user=current_user, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            logger.warning('Token scaduto')
            return jsonify({
                'success': False,
                'message': 'Token scaduto',
                'error': 'token_expired'
            }), 401
            
        except jwt.InvalidTokenError as e:
            logger.error(f'Token non valido: {str(e)}')
            return jsonify({
                'success': False,
                'message': 'Token non valido',
                'error': 'invalid_token'
            }), 401
            
        except Exception as e:
            logger.error(f'Errore durante la verifica del token: {str(e)}')
            return jsonify({
                'success': False,
                'message': 'Errore di autenticazione',
                'error': 'authentication_error'
            }), 401

    return decorated