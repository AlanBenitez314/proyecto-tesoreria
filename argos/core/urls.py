from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()
router.register(r"miembros", MiembroViewSet)
router.register(r"suscripciones", SuscripcionViewSet)
router.register(r"movimientos", MovimientoViewSet)
router.register(r"estados", EstadoMensualViewSet)

urlpatterns = [

    path("health/", health), 
    path("tabla/", tabla_estados),
    path("marcar-estado/", marcar_estado),
    path("proyeccion/", proyeccion_ingresos),
    path("tesoreria/saldo/", saldo_tesoreria),
    path("tesoreria/resumen-mensual/", resumen_mensual),
    path("capitas/pagar/", pagar_capitas),
    path("estados/inicializar-anio/", inicializar_anio),
    path("miembros/criticos/", miembros_criticos),

    path("", include(router.urls)),
]
