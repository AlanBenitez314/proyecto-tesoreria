# core/middleware/internal_only.py
import os
from django.http import HttpResponseForbidden

INTERNAL_SECRET = os.environ.get("INTERNAL_API_SECRET")
WHITELIST = ("/api/auth/token/", "/api/auth/refresh/")  # ← permitir

class RequireInternalHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        p = request.path
        if p.startswith("/api/") and p not in WHITELIST:
            header = request.META.get("HTTP_X_INTERNAL_SECRET")
            if not INTERNAL_SECRET or header != INTERNAL_SECRET:
                return HttpResponseForbidden("Forbidden")
        return self.get_response(request)
