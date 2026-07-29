import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

# Ensure BASE_DIR is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatbot.settings')

# Initialize Django WSGI application
application = get_wsgi_application()

# Automatically create database tables in /tmp/db.sqlite3 on Vercel cold starts
if os.environ.get('VERCEL'):
    try:
        call_command('migrate', interactive=False)
    except Exception as e:
        print(f"Migration warning: {e}")

app = application