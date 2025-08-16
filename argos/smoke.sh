#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000/api}"
YEAR="${YEAR:-2025}"
MIEMBRO_NOMBRE="${MIEMBRO_NOMBRE:-Test Smoke}"
FECHA_PAGO="${FECHA_PAGO:-${YEAR}-03-10}"

echo "== Listar miembros (debería responder 200) =="
curl -s "$BASE_URL/miembros/" | sed -e 's/},{/},\n{/g' || true
echo

echo "== Crear miembro =="
MIEMBRO_ID=$(curl -s -X POST "$BASE_URL/miembros/" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"'"$MIEMBRO_NOMBRE"'","grado":"M","tipo_capita":"Común","activo":true}' \
  | python3 -c 'import sys, json; print(json.load(sys.stdin)["id"])')
echo "Miembro creado con id: $MIEMBRO_ID"

echo "== Crear/actualizar suscripciones (Común/Social) =="
curl -s -X POST "$BASE_URL/suscripciones/" -H "Content-Type: application/json" \
  -d '{"tipo_capita":"Común","precio_por_capita":"15000","vigente_desde":"'"$YEAR"'-01-01"}' >/dev/null || true
curl -s -X POST "$BASE_URL/suscripciones/" -H "Content-Type: application/json" \
  -d '{"tipo_capita":"Social","precio_por_capita":"10000","vigente_desde":"'"$YEAR"'-01-01"}' >/dev/null || true
echo "Suscripciones listas."

echo "== Inicializar estados del año $YEAR =="
curl -s -X POST "$BASE_URL/estados/inicializar-anio/" \
  -H "Content-Type: application/json" \
  -d '{"anio":'"$YEAR"'}'
echo

echo "== Ver tabla anual =="
curl -s "$BASE_URL/tabla/?year=$YEAR" | head -c 400; echo; echo

echo "== Marcar estado: pagada (miembro:$MIEMBRO_ID mes:3) =="
curl -s -X POST "$BASE_URL/marcar-estado/" \
  -H "Content-Type: application/json" \
  -d '{"miembro_id":'"$MIEMBRO_ID"',"anio":'"$YEAR"',"mes":3,"estado":"pagada"}'
echo

echo "== Pagar capitas en lote (2 meses desde marzo) =="
curl -s -X POST "$BASE_URL/capitas/pagar/" \
  -H "Content-Type: application/json" \
  -d '{"miembro_id":'"$MIEMBRO_ID"',"anio":'"$YEAR"',"mes_inicio":3,"cantidad":2,"fecha_pago":"'"$FECHA_PAGO"'","comentario":"marzo+abril"}'
echo

echo "== Registrar un EGRESO para probar saldo y resumen =="
curl -s -X POST "$BASE_URL/movimientos/" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"EGRESO","fecha":"'"$YEAR"'-03-15","monto":"5000","categoria":"Compra","comentario":"Papelería"}' >/dev/null
echo "Egreso ok."

echo "== Proyección (simple) =="
curl -s "$BASE_URL/proyeccion/?year=$YEAR&incluir_deuda=true"
echo

echo "== Proyección por tipo =="
curl -s "$BASE_URL/proyeccion/?year=$YEAR&incluir_deuda=true&detalle=por_tipo"
echo

echo "== Proyección por miembro =="
curl -s "$BASE_URL/proyeccion/?year=$YEAR&incluir_deuda=true&detalle=por_miembro" | head -c 400; echo; echo

echo "== Saldo tesorería (a hoy) =="
curl -s "$BASE_URL/tesoreria/saldo/"
echo

echo "== Resumen mensual =="
curl -s "$BASE_URL/tesoreria/resumen-mensual/?year=$YEAR"
echo

echo "== Miembros críticos (consecutivos>=3) =="
curl -s "$BASE_URL/miembros/criticos/?anio=$YEAR&umbral=3"
echo

echo "== Miembros críticos (totales>=4) =="
curl -s "$BASE_URL/miembros/criticos/?anio=$YEAR&umbral=4&modo=totales"
echo

echo "OK smoke tests."
