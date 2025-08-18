from datetime import date
from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Miembro, Suscripcion, Movimiento, EstadoMensual
from .serializers import *
from django.db.models import Sum, Q
from django.utils.dateparse import parse_date
from django.db import transaction
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

class MiembroViewSet(viewsets.ModelViewSet):
    queryset = Miembro.objects.all().order_by("nombre")
    serializer_class = MiembroSerializer

class SuscripcionViewSet(viewsets.ModelViewSet):
    queryset = Suscripcion.objects.all()
    serializer_class = SuscripcionSerializer

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all().order_by("-fecha")
    serializer_class = MovimientoSerializer

class EstadoMensualViewSet(viewsets.ModelViewSet):
    queryset = EstadoMensual.objects.all()
    serializer_class = EstadoMensualSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({
        "id": u.id,
        "username": u.username,
        "is_staff": u.is_staff,
        "email": u.email or "",
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"ok": True})

@api_view(["GET"])
def tabla_estados(request):
    year = int(request.GET.get("year", date.today().year))
    miembros = list(Miembro.objects.filter(activo=True).values("id","nombre","grado","tipo_capita"))
    estados = EstadoMensual.objects.filter(anio=year).values("miembro_id","mes","estado")
    by_member = {m["id"]: {k:"debe" for k in range(1,13)} for m in miembros}
    for e in estados:
        by_member[e["miembro_id"]][e["mes"]] = e["estado"]
    rows = []
    for m in miembros:
        row = {"miembro_id": m["id"], "nombre": m["nombre"], "grado": m["grado"], "tipo_capita": m["tipo_capita"]}
        for mes in range(1,13): row[str(mes)] = by_member[m["id"]][mes]
        rows.append(row)
    return Response({"year": year, "rows": rows})

@api_view(["POST"])
def marcar_estado(request):
    miembro_id = request.data["miembro_id"]
    anio = int(request.data["anio"]); mes = int(request.data["mes"])
    estado = request.data["estado"]  # pagada/debe/exento
    obj, _ = EstadoMensual.objects.update_or_create(
        miembro_id=miembro_id, anio=anio, mes=mes, defaults={"estado": estado}
    )
    return Response({"ok": True, "id": obj.id})

@api_view(["GET"])
def proyeccion_ingresos(request):
    """
    ?year=2025
    ?incluir_deuda=true|false
    ?detalle=none|por_tipo|por_miembro
    """
    year = int(request.GET.get("year", date.today().year))
    incluir_deuda = request.GET.get("incluir_deuda", "false").lower() == "true"
    detalle = request.GET.get("detalle", "none")

    precios = {s.tipo_capita: Decimal(s.precio_por_capita) for s in Suscripcion.objects.all()}
    estados = EstadoMensual.objects.filter(anio=year)

    contadores = {}
    for e in estados:
        contadores.setdefault(e.miembro_id, {"pagada": 0, "debe": 0, "exento": 0})
        contadores[e.miembro_id][e.estado] += 1

    total_esperado = Decimal("0")
    total_proyectado = Decimal("0")
    det_tipo = {}
    det_miembro = []

    for m in Miembro.objects.filter(activo=True):
        precio = precios.get(m.tipo_capita, Decimal("0"))
        c = contadores.get(m.id, {"pagada": 0, "debe": 12, "exento": 0})
        meses_proy = c["pagada"] + (c["debe"] if incluir_deuda else 0)

        total_proyectado += Decimal(meses_proy) * precio
        total_esperado  += Decimal(12 - c["exento"]) * precio

        if detalle == "por_tipo":
            dt = det_tipo.setdefault(m.tipo_capita, {"esperado": Decimal("0"), "proyectado": Decimal("0")})
            dt["proyectado"] += Decimal(meses_proy) * precio
            dt["esperado"]   += Decimal(12 - c["exento"]) * precio
        elif detalle == "por_miembro":
            det_miembro.append({
                "miembro_id": m.id, "nombre": m.nombre, "tipo_capita": m.tipo_capita,
                "pagadas": c["pagada"], "debe": c["debe"], "exento": c["exento"],
                "esperado": float(Decimal(12 - c["exento"]) * precio),
                "proyectado": float(Decimal(meses_proy) * precio),
            })

    pagado_real = Movimiento.objects.filter(
        tipo="INGRESO", categoria="Capita"
    ).aggregate(total=Sum("monto"))["total"] or Decimal("0")

    data = {
        "year": year,
        "total_esperado": float(total_esperado),
        "total_proyectado": float(total_proyectado),
        "pagado_real": float(pagado_real),
    }
    if detalle == "por_tipo":
        data["detalle_por_tipo"] = {
            k: {"esperado": float(v["esperado"]), "proyectado": float(v["proyectado"])}
            for k, v in det_tipo.items()
        }
    if detalle == "por_miembro":
        data["detalle_por_miembro"] = det_miembro
    return Response(data)

@api_view(["GET"])
def saldo_tesoreria(request):
    """
    Retorna saldo = sum(INGRESO) - sum(EGRESO) hasta una fecha (incluida).
    Param: ?hasta=YYYY-MM-DD (opcional, default = hoy)
    """
    hasta = request.GET.get("hasta")
    if hasta:
        hasta = parse_date(hasta)
    else:
        from datetime import date
        hasta = date.today()

    qs = Movimiento.objects.filter(fecha__lte=hasta)
    ingresos = qs.filter(tipo="INGRESO").aggregate(t=Sum("monto"))["t"] or 0
    egresos  = qs.filter(tipo="EGRESO").aggregate(t=Sum("monto"))["t"] or 0
    return Response({
        "hasta": str(hasta),
        "ingresos": float(ingresos),
        "egresos": float(egresos),
        "saldo": float(ingresos - egresos),
    })

@api_view(["GET"])
def resumen_mensual(request):
    """
    ?year=2025
    Devuelve por mes: ingresos, egresos, neto
    """
    from datetime import date
    year = int(request.GET.get("year", date.today().year))

    # agregaciones por mes (1..12)
    base = Movimiento.objects.filter(fecha__year=year)
    res = []
    for mes in range(1, 12+1):
        q = base.filter(fecha__month=mes)
        ing = q.filter(tipo="INGRESO").aggregate(t=Sum("monto"))["t"] or 0
        egr = q.filter(tipo="EGRESO").aggregate(t=Sum("monto"))["t"] or 0
        res.append({"mes": mes, "ingresos": float(ing), "egresos": float(egr), "neto": float(ing - egr)})
    return Response({"year": year, "meses": res})

@api_view(["POST"])
def pagar_capitas(request):
    """
    Registrar pago de N capitas para un miembro.
    body: { "miembro_id":1, "anio":2025, "mes_inicio":3, "cantidad":2, "fecha_pago":"2025-03-10", "comentario":"marzo+abril" }
    - Marca 'pagada' esos meses en EstadoMensual
    - Crea un Movimiento de INGRESO por monto = cantidad * precio(tipo_capita)
    """
    miembro_id = int(request.data["miembro_id"])
    anio = int(request.data["anio"])
    mes_inicio = int(request.data["mes_inicio"])
    cantidad = int(request.data["cantidad"])
    fecha_pago = request.data.get("fecha_pago")
    comentario = request.data.get("comentario", "")

    m = Miembro.objects.get(id=miembro_id)
    precio_por_mes = Suscripcion.objects.get(tipo_capita=m.tipo_capita).precio_por_capita
    meses = []
    for i in range(cantidad):
        mes = mes_inicio + i
        if mes<1 or mes>12:
            raise ValueError("Los meses deben quedar dentro de 1..12 para el mismo año.")
        meses.append(mes)

    with transaction.atomic():
        for mes in meses:
            EstadoMensual.objects.update_or_create(
                miembro=m, anio=anio, mes=mes, defaults={"estado":"pagada"}
            )
        Movimiento.objects.create(
            tipo="INGRESO", fecha=fecha_pago, monto=precio_por_mes * cantidad,
            miembro=m, categoria="Capita", comentario=comentario
        )
    return Response({"ok": True, "miembro_id": miembro_id, "meses_pagados": meses, "monto": float(precio_por_mes*cantidad)})

@api_view(["POST"])
def inicializar_anio(request):
    """
    Crea/asegura 12 Estados 'debe' para todos los miembros activos del año dado.
    body: { "anio": 2026 }
    """
    anio = int(request.data["anio"])
    miembros = Miembro.objects.filter(activo=True)
    creados = 0
    for m in miembros:
        for mes in range(1,13):
            _, created = EstadoMensual.objects.get_or_create(
                miembro=m, anio=anio, mes=mes, defaults={"estado":"debe"}
            )
            if created: creados += 1
    return Response({"ok": True, "anio": anio, "estados_creados": creados})

@api_view(["GET"])
def miembros_criticos(request):
    """
    ?anio=2025
    ?umbral=3             # meses
    ?modo=consecutivos|totales  (default: consecutivos)
    Retorna miembros con >= umbral de 'debe' consecutivos (o totales).
    """
    from datetime import date
    anio = int(request.GET.get("anio", date.today().year))
    umbral = int(request.GET.get("umbral", "3"))
    modo = request.GET.get("modo", "consecutivos")

    res = []
    for m in Miembro.objects.filter(activo=True):
        estados = {e["mes"]: e["estado"] for e in EstadoMensual.objects.filter(anio=anio, miembro=m).values("mes","estado")}
        if modo == "totales":
            tot_debe = sum(1 for mes in range(1,13) if estados.get(mes,"debe")=="debe")
            if tot_debe >= umbral:
                res.append({"miembro_id": m.id, "nombre": m.nombre, "debe_totales": tot_debe})
        else:
            # consecutivos
            streak = best = 0
            for mes in range(1,13):
                if estados.get(mes,"debe") == "debe":
                    streak += 1
                    best = max(best, streak)
                else:
                    streak = 0
            if best >= umbral:
                res.append({"miembro_id": m.id, "nombre": m.nombre, "debe_consecutivos": best})

    return Response({"anio": anio, "umbral": umbral, "modo": modo, "miembros": res})