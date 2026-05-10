"""
WSGI config for aarohan project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import sys

from django.core.wsgi import get_wsgi_application
from whitenoise.wsgi import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aarohan.settings')

try:
    application = get_wsgi_application()
    application = WhiteNoise(application)
except Exception as e:
    print(f"Error loading Django WSGI: {e}", file=sys.stderr)
    raise
