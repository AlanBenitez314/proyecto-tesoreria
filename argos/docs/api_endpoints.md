
# API Endpoints - Proyecto Argos

Este documento describe todos los endpoints disponibles en el backend de Argos, con ejemplos de uso en `curl` y ejemplos de respuestas en JSON.

## Base URL
```
http://127.0.0.1:8000/api/
```

---

## CRUD - ViewSets

### Miembros
```bash
# LISTAR
curl -s http://127.0.0.1:8000/api/miembros/
```
**Ejemplo de respuesta**
```json
[
  {
    "id": 1,
    "nombre": "Alan Benitez",
    "grado": "M",
    "tipo_capita": "Común",
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Juan Pablo Nores",
    "grado": "M",
    "tipo_capita": "Social",
    "activo": true
  }
]
```

```bash
# CREAR
curl -s -X POST http://127.0.0.1:8000/api/miembros/   -H "Content-Type: application/json"   -d '{"nombre":"Ada Lovelace","grado":"M","tipo_capita":"Común","activo":true}'
```
**Ejemplo de respuesta**
```json
{
  "id": 3,
  "nombre": "Ada Lovelace",
  "grado": "M",
  "tipo_capita": "Común",
  "activo": true
}
```

---

### Suscripciones
```bash
# LISTAR
curl -s http://127.0.0.1:8000/api/suscripciones/
```
**Ejemplo de respuesta**
```json
[
  {
    "id": 1,
    "tipo_capita": "Común",
    "precio_por_capita": 15000,
    "vigente_desde": "2025-01-01"
  },
  {
    "id": 2,
    "tipo_capita": "Social",
    "precio_por_capita": 10000,
    "vigente_desde": "2025-01-01"
  }
]
```

---

### Movimientos
```bash
# LISTAR
curl -s http://127.0.0.1:8000/api/movimientos/
```
**Ejemplo de respuesta**
```json
[
  {
    "id": 1,
    "tipo": "INGRESO",
    "fecha": "2025-03-10",
    "monto": 30000,
    "miembro": 1,
    "categoria": "Capita",
    "comentario": "marzo+abril"
  },
  {
    "id": 2,
    "tipo": "EGRESO",
    "fecha": "2025-03-15",
    "monto": 5000,
    "miembro": null,
    "categoria": "Compra",
    "comentario": "Papeleria"
  }
]
```

---

### Estados Mensuales
```bash
# LISTAR
curl -s http://127.0.0.1:8000/api/estados/
```
**Ejemplo de respuesta**
```json
[
  {"id": 1, "miembro": 1, "anio": 2025, "mes": 3, "estado": "pagada"},
  {"id": 2, "miembro": 1, "anio": 2025, "mes": 4, "estado": "pagada"},
  {"id": 3, "miembro": 1, "anio": 2025, "mes": 5, "estado": "debe"}
]
```

---

## Endpoints adicionales

### Tabla de Estados
```bash
curl -s "http://127.0.0.1:8000/api/tabla/?year=2025"
```
**Ejemplo de respuesta**
```json
{
  "year": 2025,
  "rows": [
    {
      "miembro_id": 1,
      "nombre": "Alan Benitez",
      "1": "debe",
      "2": "debe",
      "3": "pagada",
      "4": "pagada",
      "5": "debe"
    },
    {
      "miembro_id": 2,
      "nombre": "Juan Pablo Nores",
      "1": "debe",
      "2": "debe",
      "3": "debe"
    }
  ]
}
```

---

### Marcar Estado
```bash
curl -s -X POST http://127.0.0.1:8000/api/marcar-estado/   -H "Content-Type: application/json"   -d '{"miembro_id":1,"anio":2025,"mes":8,"estado":"pagada"}'
```
**Ejemplo de respuesta**
```json
{"ok": true, "mensaje": "Estado actualizado"}
```

---

### Proyección de ingresos
```bash
curl -s "http://127.0.0.1:8000/api/proyeccion/?year=2025&incluir_deuda=true"
```
**Ejemplo de respuesta**
```json
{
  "total_esperado": 300000.0,
  "total_proyectado": 280000.0,
  "pagado_real": 35000.0
}
```

```bash
curl -s "http://127.0.0.1:8000/api/proyeccion/?year=2025&incluir_deuda=true&detalle=por_tipo"
```
**Ejemplo de respuesta**
```json
{
  "total_esperado": 300000.0,
  "detalle_por_tipo": {
    "Común": 200000.0,
    "Social": 100000.0
  }
}
```

```bash
curl -s "http://127.0.0.1:8000/api/proyeccion/?year=2025&incluir_deuda=true&detalle=por_miembro"
```
**Ejemplo de respuesta**
```json
{
  "total_esperado": 300000.0,
  "detalle_por_miembro": [
    {"miembro_id": 1, "nombre": "Alan Benitez", "total": 150000.0},
    {"miembro_id": 2, "nombre": "Juan Pablo Nores", "total": 150000.0}
  ]
}
```

---

### Saldo Tesorería
```bash
curl -s http://127.0.0.1:8000/api/tesoreria/saldo/
```
**Ejemplo de respuesta**
```json
{"saldo": 25000.0}
```

---

### Resumen Mensual
```bash
curl -s "http://127.0.0.1:8000/api/tesoreria/resumen-mensual/?year=2025"
```
**Ejemplo de respuesta**
```json
{
  "year": 2025,
  "meses": [
    {"mes": 3, "ingresos": 30000.0, "egresos": 5000.0}
  ]
}
```

---

### Pagar Capitas
```bash
curl -s -X POST http://127.0.0.1:8000/api/capitas/pagar/   -H "Content-Type: application/json"   -d '{"miembro_id":2,"anio":2025,"mes_inicio":6,"cantidad":3,"fecha_pago":"2025-06-05","comentario":"jun-jul-ago"}'
```
**Ejemplo de respuesta**
```json
{"ok": true, "capitas_pagadas": [6, 7, 8], "monto_total": 30000.0}
```

---

### Inicializar Año
```bash
curl -s -X POST http://127.0.0.1:8000/api/estados/inicializar-anio/   -H "Content-Type: application/json"   -d '{"anio":2026}'
```
**Ejemplo de respuesta**
```json
{"ok": true, "anio": 2026, "estados_creados": 24}
```

---

### Miembros Críticos
```bash
# Por consecutivos
curl -s "http://127.0.0.1:8000/api/miembros/criticos/?anio=2025&umbral=3"
```
**Ejemplo de respuesta**
```json
{
  "miembros": [
    {"miembro_id": 2, "nombre": "Juan Pablo Nores", "consecutivos": 12}
  ]
}
```

```bash
# Por totales
curl -s "http://127.0.0.1:8000/api/miembros/criticos/?anio=2025&umbral=10&modo=totales"
```
**Ejemplo de respuesta**
```json
{
  "miembros": [
    {"miembro_id": 2, "nombre": "Juan Pablo Nores", "total_debe": 12}
  ]
}
```
