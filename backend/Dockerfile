FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia l'intero package app mantenendo la struttura
COPY app/ ./app/

EXPOSE 15000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "15000"]