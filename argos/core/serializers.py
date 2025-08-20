# core/serializers.py
from rest_framework import serializers
from .models import Miembro, Suscripcion, Movimiento, EstadoMensual


class MiembroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Miembro
        fields = "__all__"

    def validate(self, attrs):
        tipo = attrs.get("tipo_capita", getattr(self.instance, "tipo_capita", None))
        if tipo in ("Común", "Social") and not Suscripcion.objects.filter(tipo_capita=tipo).exists():
            raise serializers.ValidationError({
                "tipo_capita": f"No hay precio configurado para '{tipo}'. Cargá una Suscripción primero."
            })
        return attrs

class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta: model = Suscripcion; fields = "__all__"

class MovimientoSerializer(serializers.ModelSerializer):
    class Meta: model = Movimiento; fields = "__all__"

class EstadoMensualSerializer(serializers.ModelSerializer):
    class Meta: model = EstadoMensual; fields = "__all__"


class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta: model = Suscripcion; fields = "__all__"

class MovimientoSerializer(serializers.ModelSerializer):
    class Meta: model = Movimiento; fields = "__all__"

class EstadoMensualSerializer(serializers.ModelSerializer):
    class Meta: model = EstadoMensual; fields = "__all__"
