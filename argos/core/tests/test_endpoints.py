from datetime import date
from django.test import TestCase
from rest_framework.test import APIClient
from core.models import Miembro, Suscripcion, EstadoMensual, Movimiento

class TesoreriaAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client = APIClient()

        # Datos base
        cls.year = 2025
        cls.m1 = Miembro.objects.create(nombre="Alan Benitez", grado="M", tipo_capita="Común", activo=True)
        cls.m2 = Miembro.objects.create(nombre="Juan Pablo Nores", grado="M", tipo_capita="Social", activo=True)

        # Suscripciones
        Suscripcion.objects.create(tipo_capita="Común", precio_por_capita=15000, vigente_desde=date(cls.year,1,1))
        Suscripcion.objects.create(tipo_capita="Social", precio_por_capita=10000, vigente_desde=date(cls.year,1,1))

        # Estados: todo "debe" por defecto; m1 paga marzo y abril
        for m in (cls.m1, cls.m2):
            for mes in range(1, 13):
                EstadoMensual.objects.create(miembro=m, anio=cls.year, mes=mes, estado="debe")
        EstadoMensual.objects.filter(miembro=cls.m1, anio=cls.year, mes__in=[3,4]).update(estado="pagada")

        # Movimientos: ingreso por 2 capitas de m1 y un egreso
        Movimiento.objects.create(tipo="INGRESO", fecha=date(cls.year,3,10), monto=30000, miembro=cls.m1, categoria="Capita", comentario="marzo+abril")
        Movimiento.objects.create(tipo="EGRESO", fecha=date(cls.year,3,15), monto=5000, categoria="Compra", comentario="Papeleria")

    def test_listar_miembros(self):
        r = self.client.get("/api/miembros/")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(any(x["nombre"] == "Alan Benitez" for x in r.json()))

    def test_tabla_estados(self):
        r = self.client.get(f"/api/tabla/?year={self.year}")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["year"], self.year)
        row_m1 = next(x for x in data["rows"] if x["miembro_id"] == self.m1.id)
        self.assertEqual(row_m1["3"], "pagada")
        self.assertEqual(row_m1["4"], "pagada")
        self.assertEqual(row_m1["5"], "debe")

    def test_marcar_estado(self):
        payload = {"miembro_id": self.m2.id, "anio": self.year, "mes": 2, "estado": "exento"}
        r = self.client.post("/api/marcar-estado/", payload, format="json")
        self.assertEqual(r.status_code, 200)
        e = EstadoMensual.objects.get(miembro=self.m2, anio=self.year, mes=2)
        self.assertEqual(e.estado, "exento")

    def test_proyeccion_simple(self):
        r = self.client.get(f"/api/proyeccion/?year={self.year}&incluir_deuda=true")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("total_esperado", data)
        self.assertIn("total_proyectado", data)
        self.assertIn("pagado_real", data)
        self.assertGreaterEqual(data["pagado_real"], 30000.0)

    def test_proyeccion_por_tipo(self):
        r = self.client.get(f"/api/proyeccion/?year={self.year}&incluir_deuda=true&detalle=por_tipo")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("detalle_por_tipo", data)
        self.assertIn("Común", data["detalle_por_tipo"])

    def test_proyeccion_por_miembro(self):
        r = self.client.get(f"/api/proyeccion/?year={self.year}&incluir_deuda=true&detalle=por_miembro")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("detalle_por_miembro", data)
        self.assertTrue(any(d["miembro_id"] == self.m1.id for d in data["detalle_por_miembro"]))

    def test_saldo_tesoreria(self):
        r = self.client.get("/api/tesoreria/saldo/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("saldo", data)
        # Con ingreso 30000 y egreso 5000, saldo >= 25000
        self.assertGreaterEqual(data["saldo"], 25000.0)

    def test_resumen_mensual(self):
        r = self.client.get(f"/api/tesoreria/resumen-mensual/?year={self.year}")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["year"], self.year)
        marzo = next(m for m in data["meses"] if m["mes"] == 3)
        self.assertGreaterEqual(marzo["ingresos"], 30000.0)
        self.assertGreaterEqual(marzo["egresos"], 5000.0)

    def test_pagar_capitas(self):
        payload = {
            "miembro_id": self.m2.id,
            "anio": self.year,
            "mes_inicio": 6,
            "cantidad": 3,
            "fecha_pago": f"{self.year}-06-05",
            "comentario": "jun-jul-ago",
        }
        r = self.client.post("/api/capitas/pagar/", payload, format="json")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(data["ok"])
        # Estados actualizados
        for mes in [6,7,8]:
            e = EstadoMensual.objects.get(miembro=self.m2, anio=self.year, mes=mes)
            self.assertEqual(e.estado, "pagada")
        # Movimiento creado
        mov = Movimiento.objects.filter(miembro=self.m2, tipo="INGRESO", fecha=date(self.year,6,5)).first()
        self.assertIsNotNone(mov)
        # Precio Social = 10000 -> 3 * 10000 = 30000
        self.assertEqual(float(mov.monto), 30000.0)

    def test_inicializar_anio(self):
        siguiente = self.year + 1
        r = self.client.post("/api/estados/inicializar-anio/", {"anio": siguiente}, format="json")
        self.assertEqual(r.status_code, 200)
        # Debe haber 12 estados por miembro activo para el nuevo año
        count_m1 = EstadoMensual.objects.filter(miembro=self.m1, anio=siguiente).count()
        count_m2 = EstadoMensual.objects.filter(miembro=self.m2, anio=siguiente).count()
        self.assertEqual(count_m1, 12)
        self.assertEqual(count_m2, 12)

    def test_miembros_criticos(self):
        # m2 tiene todos "debe" (12), debe aparecer con consecutivos>=3
        r = self.client.get(f"/api/miembros/criticos/?anio={self.year}&umbral=3")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(any(x["miembro_id"] == self.m2.id for x in data["miembros"]))

        # modo totales, umbral alto
        r2 = self.client.get(f"/api/miembros/criticos/?anio={self.year}&umbral=10&modo=totales")
        self.assertEqual(r2.status_code, 200)
        data2 = r2.json()
        self.assertTrue(any(x["miembro_id"] == self.m2.id for x in data2["miembros"]))
