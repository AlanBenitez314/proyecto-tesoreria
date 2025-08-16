from datetime import date
from core.models import Miembro, Suscripcion, EstadoMensual

# Crear miembros
miembros_data = [
    {"nombre": "Juan Pablo Nores", "grado": "M", "tipo_capita": "Común"},
    {"nombre": "Alan Benitez", "grado": "M", "tipo_capita": "Común"},
    {"nombre": "Giuliano Russo", "grado": "M", "tipo_capita": "Común"},
    {"nombre": "Matias Rivas", "grado": "M", "tipo_capita": "Común"},
]
for data in miembros_data:
    Miembro.objects.get_or_create(nombre=data["nombre"], defaults=data)

# Crear suscripciones
Suscripcion.objects.update_or_create(
    tipo_capita="Común",
    defaults={"precio_por_capita": 15000, "vigente_desde": date(2025, 1, 1)},
)
Suscripcion.objects.update_or_create(
    tipo_capita="Social",
    defaults={"precio_por_capita": 10000, "vigente_desde": date(2025, 1, 1)},
)

# Inicializar todos los meses de 2025 como "debe"
for m in Miembro.objects.all():
    for mes in range(1, 13):
        EstadoMensual.objects.get_or_create(
            miembro=m, anio=2025, mes=mes, defaults={"estado": "debe"}
        )

print("✔ Datos de prueba cargados correctamente.")
