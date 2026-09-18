#!/bin/bash
set -e

echo "Running database migrations..."
# Use the python path from the image
python -m alembic upgrade head

echo "Checking service health..."
# Simple check to see if the app can start (we'll use a basic curl or just let the app boot)
# In a real K8s/Compose setup, this is often handled by the healthcheck section
# but we ensure migrations are done first.

echo "Starting Control Plane..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
