# Sweet Cost · IA con n8n

Este proyecto queda preparado para dos flujos de IA mediante n8n:

## 1. Proyección de ingresos con IA

Webhook:

- Método: `POST`
- Path: `sweet-cost/proyeccion`

El frontend envía:

```json
{
  "accion": "proyectar_ingresos",
  "origen": "sweet-cost",
  "negocio": {
    "id": "ID",
    "nombre": "Nombre",
    "tipo": "Repostería"
  },
  "historialMensual": [
    {
      "key": "2026-08",
      "ventas": 120000,
      "costos": 70000,
      "ganancia": 50000
    }
  ],
  "resumen": {
    "ventasRealizadas": 120000,
    "costosRealizados": 70000,
    "gananciaRealizada": 50000,
    "pedidosRealizados": 10,
    "pedidosPendientes": 3,
    "cotizacionesPendientes": 2,
    "stockEnRiesgo": 4,
    "stockCritico": 1
  }
}
```

El workflow de n8n puede ser:

```text
Webhook
  ↓
Code / Normalizar datos
  ↓
Nodo de IA (Gemini/OpenAI u otro proveedor)
  ↓
Code / Validar JSON
  ↓
Respond to Webhook
```

La IA debe devolver JSON, no texto libre:

```json
{
  "ok": true,
  "proyeccion": {
    "mensual": {
      "ventas": 135000,
      "ganancia": 58000
    },
    "anual": {
      "ventas": 1620000,
      "ganancia": 696000
    }
  },
  "analisis": "La tendencia reciente muestra crecimiento moderado...",
  "factores": [
    "Crecimiento de ventas recientes",
    "Margen promedio",
    "Pedidos pendientes"
  ]
}
```

El prompt recomendado para el nodo de IA:

> Actúa como analista financiero para un pequeño negocio. Analiza exclusivamente los datos proporcionados. Calcula una proyección mensual y anual razonable considerando tendencia reciente, promedio histórico, costos y margen. No inventes ventas, clientes ni datos externos. Si hay pocos datos, indícalo en el análisis y reduce la confianza de la conclusión. Devuelve únicamente JSON válido con las claves `ok`, `proyeccion.mensual.ventas`, `proyeccion.mensual.ganancia`, `proyeccion.anual.ventas`, `proyeccion.anual.ganancia`, `analisis` y `factores`.

El dashboard ya usa esta respuesta y mantiene una estimación local como respaldo si el webhook todavía no está configurado.

---

## 2. Asistente de facturas con IA

Webhook:

- Método: `POST`
- Path: `sweet-cost/facturas-ia`

En Sweet Cost aparece como una burbuja flotante **Facturas IA** para administradores.

Permite:

- escribir una consulta;
- adjuntar PDF;
- adjuntar PNG/JPG/WEBP;
- pedir extracción y análisis;
- revisar los datos detectados;
- confirmar el registro de la factura.

### Primera llamada: analizar factura

El frontend envía `multipart/form-data`:

- `accion`: `analizar_factura`
- `mensaje`
- `negocioId`
- `negocioNombre`
- `empleadoId`
- `empleadoNombre`
- `factura`: archivo

Workflow recomendado:

```text
Webhook
  ↓
Extraer archivo
  ↓
Nodo de IA / visión
  ↓
Normalizar factura
  ↓
Respond to Webhook
```

Respuesta esperada:

```json
{
  "ok": true,
  "mensaje": "Encontré los datos principales de la factura. Revísalos antes de registrarla.",
  "requiereConfirmacion": true,
  "factura": {
    "proveedor": "Proveedor",
    "numero": "FAC-001",
    "fecha": "2026-10-02",
    "total": 12500,
    "moneda": "₡",
    "items": [
      {
        "nombre": "Harina",
        "cantidad": 2,
        "precio": 1500
      }
    ]
  }
}
```

### Confirmar registro

Cuando el administrador pulsa **Confirmar y registrar factura**, el frontend vuelve a llamar al mismo webhook con:

```json
{
  "accion": "confirmar_factura",
  "mensaje": "Confirmar registro de la factura.",
  "negocioId": "ID_NEGOCIO",
  "empleadoId": "ID_ADMIN",
  "factura": {
    "proveedor": "Proveedor",
    "numero": "FAC-001",
    "fecha": "2026-10-02",
    "total": 12500,
    "moneda": "₡",
    "items": []
  }
}
```

El workflow debe:

```text
Webhook
  ↓
Validar factura
  ↓
HTTP Request → JSON Server /facturas
  ↓
Respond to Webhook
```

La colección `facturas` ya fue agregada a `db.json`.

### Importante

La API key del proveedor de IA debe quedarse en **n8n**, nunca en React ni en `.env` del frontend.

Para desarrollo local, los webhooks usan:

```text
http://localhost:5678/webhook-test/...
```

Cuando los workflows estén activos, cambia las variables a:

```text
http://localhost:5678/webhook/...
```
