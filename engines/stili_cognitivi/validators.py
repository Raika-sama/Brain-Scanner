# validators.py

from marshmallow import Schema, fields, validates, ValidationError
from shared.config import Config
from functools import wraps
from flask import request, jsonify

class RispostaSchema(Schema):
    """Schema per validare una singola risposta"""
    domanda = fields.Integer(required=True)
    risposta = fields.String(required=True)

    @validates('domanda')
    def validate_domanda(self, value):
        # Validazione numero domanda (0-29 per 5 categorie con 6 domande ciascuna)
        if not 0 <= value < (Config.DOMANDE_PER_CATEGORIA * 5):
            raise ValidationError(
                f'Numero domanda non valido: deve essere tra 0 e {Config.DOMANDE_PER_CATEGORIA * 5 - 1}'
            )

    @validates('risposta')
    def validate_risposta(self, value):
        if value not in Config.VALID_RISPOSTE:
            raise ValidationError(
                f'Risposta non valida. Valori ammessi: {", ".join(Config.VALID_RISPOSTE)}'
            )

class TestInputSchema(Schema):
    """Schema per validare l'intero set di risposte"""
    user_id = fields.String(required=True)
    test_id = fields.String(required=True)
    risposte = fields.List(
        fields.Nested(RispostaSchema), 
        required=True, 
        validate=lambda x: len(x) == Config.DOMANDE_PER_CATEGORIA * 5
    )

def validate_test_input(f):
    """Decoratore per validare l'input del test"""
    @wraps(f)
    def decorated(*args, **kwargs):
        schema = TestInputSchema()
        try:
            data = request.get_json()
            # Valida i dati
            validated_data = schema.load(data)
            # Se la validazione passa, aggiungi i dati validati alla request
            request.validated_data = validated_data
            return f(*args, **kwargs)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'message': 'Errore di validazione',
                'errors': err.messages
            }), 400
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Errore durante la validazione',
                'error': str(e)
            }), 500
    return decorated

def validate_user_permissions(required_roles=None):
    """Decoratore per validare i permessi dell'utente"""
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            if required_roles and current_user['ruolo'] not in required_roles:
                return jsonify({
                    'success': False,
                    'message': 'Permessi insufficienti'
                }), 403
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator