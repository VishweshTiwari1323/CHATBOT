import os
import sys
from pathlib import Path

# Path to the directory containing manage.py and APICHAT
BASE_DIR = Path(__file__).resolve().parent.parent

# Force Python to search BASE_DIR for 'APICHAT' and 'chatbot'
sys_path_str = str(BASE_DIR)
if sys_path_str not in sys.path:
    sys.path.insert(0, sys_path_str)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot.settings')

from django.core.wsgi import get_wsgi_application

# Initialize WSGI application
application = get_wsgi_application()

# Vercel serverless entrypoint
app = application