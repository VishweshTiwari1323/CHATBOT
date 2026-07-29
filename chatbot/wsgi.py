import os
import sys
from pathlib import Path

# Adds the middle folder (containing manage.py and APICHAT) to Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Entry point for Vercel serverless
app = application