from django.contrib import admin
from .models import Miembro, Suscripcion, Movimiento, EstadoMensual

@admin.register(Miembro)
class MiembroAdmin(admin.ModelAdmin):
    list_display = ("nombre","grado","tipo_capita","activo")
    list_filter = ("activo","tipo_capita","grado")
    search_fields = ("nombre",)

admin.site.register(Suscripcion)
admin.site.register(Movimiento)
admin.site.register(EstadoMensual)
