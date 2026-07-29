#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Installing Dependencies ==="
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

echo "=== Collecting Static Files ==="
python3 manage.py collectstatic --noinput --clear

echo "=== Build Finished ==="