# core/helpers.py
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from .models import Suscripcion

def precio_capita_or_400(tipo_capita: str) -> Decimal:
    """
    Devuelve el precio vigente para el tipo de cápite.
    Lanza ValidationError(400) si no está configurado.
    """
    try:
        s = Suscripcion.objects.get(tipo_capita=tipo_capita)
        return s.precio_por_capita
    except Suscripcion.DoesNotExist:
        raise ValidationError(
            {"detail": f"No hay Suscripción (precio) configurada para tipo '{tipo_capita}'."}
        )

def meses_en_rango_1a12(mes_inicio: int, cantidad: int) -> list[int]:
    """
    Construye [mes_inicio, mes_inicio+1, ...] y valida 1..12.
    Lanza ValidationError(400) ante errores.
    """
    if cantidad < 1:
        raise ValidationError({"detail": "La cantidad debe ser >= 1."})
    meses = [mes_inicio + i for i in range(cantidad)]
    if any(m < 1 or m > 12 for m in meses):
        raise ValidationError({"detail": "Los meses deben quedar dentro de 1..12 para el mismo año."})
    return meses