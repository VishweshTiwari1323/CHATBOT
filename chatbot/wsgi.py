import os
import sys
from pathlib import Path

# Add project root directory to Python path for Vercel serverless execution
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Entry point for Vercel
app = application