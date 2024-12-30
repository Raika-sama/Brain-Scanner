FROM python:3.9-slim

WORKDIR /app

# Prima copiamo il requirements.txt e installiamo le dipendenze
COPY stili_cognitivi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamo il codice dell'applicazione
# Nota: il context del build è ./engines/stili_cognitivi, quindi dobbiamo modificare i path
COPY shared/ /app/shared/
COPY stili_cognitivi/ /app/stili_cognitivi/

ENV PYTHONPATH=/app \
    JWT_ALGORITHM=HS256 \
    JWT_SECRET="" \
    FLASK_ENV=development

EXPOSE 5001

CMD ["python", "-m", "stili_cognitivi.main"]