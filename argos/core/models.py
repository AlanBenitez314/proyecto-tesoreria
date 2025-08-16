from django.db import models

class Miembro(models.Model):
    nombre = models.CharField(max_length=120)
    grado = models.CharField(max_length=2, blank=True)        # A/C/M u otro
    tipo_capita = models.CharField(max_length=20, default="Común")  # Común/Social
    activo = models.BooleanField(default=True)
    def __str__(self): return self.nombre

class Suscripcion(models.Model):
    """Precio por capita vigente por tipo."""
    TIPO_CHOICES = (("Común","Común"),("Social","Social"))
    tipo_capita = models.CharField(max_length=20, choices=TIPO_CHOICES, unique=True)
    precio_por_capita = models.DecimalField(max_digits=10, decimal_places=2)
    vigente_desde = models.DateField()
    def __str__(self): return f"{self.tipo_capita} ${self.precio_por_capita}"

class Movimiento(models.Model):
    """Ingreso/Egreso contable."""
    TIPO = (("INGRESO","INGRESO"), ("EGRESO","EGRESO"))
    tipo = models.CharField(max_length=7, choices=TIPO)
    fecha = models.DateField()
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    miembro = models.ForeignKey(Miembro, null=True, blank=True, on_delete=models.SET_NULL)
    categoria = models.CharField(max_length=60, default="Capita")  # simple para MVP
    comentario = models.CharField(max_length=200, blank=True)

class EstadoMensual(models.Model):
    """Estado por miembro y mes: pagada/debe/exento (para la grilla)."""
    ESTADO = (("pagada","pagada"),("debe","debe"),("exento","exento"))
    miembro = models.ForeignKey(Miembro, on_delete=models.CASCADE)
    anio = models.IntegerField()
    mes = models.IntegerField()      # 1..12
    estado = models.CharField(max_length=10, choices=ESTADO, default="debe")
    class Meta:
        unique_together = ("miembro","anio","mes")
