from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-$(j3pe$eh4w-g+*fnshapt*!8my3=a3p!z#a09qc((a5z=6-t2'

DEBUG = True

ALLOWED_HOSTS = []

# ───────────────────────────────────────────────
# APPS
# ───────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'drf_spectacular',
    'accounts',
    'firms',
    'clients',
    'cases',
    'documents',
    'payments',
    'subscriptions',
    'messaging',
    'notifications',
    'adminpanel',

    'rest_framework',
    'corsheaders',
     'tasks',
    'support',
    'email_service'
]

# ───────────────────────────────────────────────
# MIDDLEWARE
# ───────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    'corsheaders.middleware.CorsMiddleware',  # 🔥 move UP

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'legal_management_system.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'legal_management_system.wsgi.application'

# ───────────────────────────────────────────────
# DATABASE
# ───────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ───────────────────────────────────────────────
# PASSWORD VALIDATION
# ───────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ───────────────────────────────────────────────
# INTERNATIONALIZATION
# ───────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ───────────────────────────────────────────────
# STATIC FILES
# ───────────────────────────────────────────────
STATIC_URL = '/static/'

# ───────────────────────────────────────────────
# 🔥 MEDIA FILES (VERY IMPORTANT FIX)
# ───────────────────────────────────────────────
MEDIA_URL = '/case_files/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'case_files')# ───────────────────────────────────────────────
# REST FRAMEWORK
# ───────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ───────────────────────────────────────────────
# CORS
# ───────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# ───────────────────────────────────────────────
# EMAIL
# ───────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'mail.rakle.in'
EMAIL_PORT = 25
EMAIL_USE_TLS = False
EMAIL_HOST_USER = 'helpdesk@rakle.in'
EMAIL_HOST_PASSWORD = 'Kumkum@1234'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
FIREBASE_CREDENTIALS_PATH = str(BASE_DIR / "firebase-service-account.json")
FRONTEND_URL = "http://localhost:5173"