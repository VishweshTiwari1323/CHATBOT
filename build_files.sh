#!/bin/bash
set -e

echo "=== Installing Dependencies ==="
python3 -m pip install -r requirements.txt --break-system-packages

echo "=== Collecting Static Files ==="
python3 manage.py collectstatic --noinput --clear

echo "=== Build Finished ==="
