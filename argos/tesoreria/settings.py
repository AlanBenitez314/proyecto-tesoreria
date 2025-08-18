from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Seguridad básica ---
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-cambiame-por-env"
)
DEBUG = False

ALLOWED_HOSTS = [
    "argonautas.org", "www.argonautas.org",
    "info.argonautas.org", "tripulante.argonautas.org", "camara.argonautas.org",
    "localhost", "127.0.0.1",
]

# --- Apps ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "rest_framework",
    "corsheaders",

    # local apps
    "core",
]

# --- Middleware ---
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",           # CORS primero
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    # Requiere cabecera interna en /api/ (tu middleware)
    "core.middleware.internal_only.RequireInternalHeaderMiddleware",
]

ROOT_URLCONF = "tesoreria.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "tesoreria.wsgi.application"

# --- Base de datos ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# --- Password validators ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- i18n / zona horaria ---
LANGUAGE_CODE = "es-ar"
TIME_ZONE = "America/Argentina/Buenos_Aires"
USE_I18N = True
USE_TZ = False  # manejás horarios locales

# --- Static ---
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"   # collectstatic apunta acá

# --- DRF / JWT ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}

# --- CORS / CSRF ---
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://argonautas.org",
    "https://www.argonautas.org",
    "https://info.argonautas.org",
    "https://tripulante.argonautas.org",
    "https://camara.argonautas.org",
]
# si preferís una sola regla para todos los subdominios:
# CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://([a-z0-9-]+\.)?argonautas\.org$"]

CORS_ALLOW_HEADERS = list((
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
))

CSRF_TRUSTED_ORIGINS = [
    "https://argonautas.org",
    "https://www.argonautas.org",
    "https://info.argonautas.org",
    "https://tripulante.argonautas.org",
    "https://camara.argonautas.org",
]

# --- Detrás de Nginx/HTTPS ---
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS (podés subir el tiempo cuando confirmes todo)
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30  # 30 días
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Opcional: logging básico para detectar errores en prod
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}