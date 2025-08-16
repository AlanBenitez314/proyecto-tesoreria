from rest_framework import serializers
from .models import Miembro, Suscripcion, Movimiento, EstadoMensual

class MiembroSerializer(serializers.ModelSerializer):
    class Meta: model = Miembro; fields = "__all__"

class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta: model = Suscripcion; fields = "__all__"

class MovimientoSerializer(serializers.ModelSerializer):
    class Meta: model = Movimiento; fields = "__all__"

class EstadoMensualSerializer(serializers.ModelSerializer):
    class Meta: model = EstadoMensual; fields = "__all__"
