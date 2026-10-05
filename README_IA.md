# Sweet Cost · IA con n8n

Este proyecto queda preparado para dos flujos de IA mediante n8n:

## 1. Proyección de ingresos con IA

Webhook:

- Método: `POST`
- Path: `sweet-cost/proyeccion`

El frontend envía únicamente el negocio activo:

```json
{
  "negocioId": "ID_DEL_NEGOCIO"
}
```

El workflow de n8n obtiene los datos reales directamente desde JSON Server y los prepara antes de enviarlos a Groq:

```text
Webhook
  ↓
Obtener pedidos
  ↓
Obtener productos
  ↓
Obtener insumos
  ↓
Preparar datos
  ↓
Basic LLM Chain + Groq Chat Model
  ↓
Parsear respuesta
  ↓
Respond to Webhook
```

El nodo `Preparar datos` filtra los pedidos por `negocioId`, considera como ventas históricas los pedidos `Entregado` o `Pagado`, agrupa ventas/costos por mes y cuenta productos e insumos del negocio. Los pedidos pendientes no se contabilizan como ventas realizadas.

Groq debe devolver únicamente JSON con esta estructura:

```json
{
  "proyeccionMensual": {
    "ventas": 0,
    "costos": 0,
    "ganancia": 0
  },
  "proyeccionAnual": {
    "ventas": 0,
    "costos": 0,
    "ganancia": 0
  },
  "tendencia": "creciente",
  "confianza": "media",
  "analisis": "",
  "factores": []
}
```

El Dashboard consume directamente `proyeccionMensual` y `proyeccionAnual`, y muestra también la confianza y tendencia calculadas por la IA. Si n8n no responde, el Dashboard mantiene su estimación local como respaldo y muestra el error de conexión.

En `.env` se utiliza el webhook de producción cuando el workflow está activo:

```env
VITE_N8N_PROYECCION_URL=http://localhost:5678/webhook/sweet-cost/proyeccion
```

La API key de Groq debe permanecer únicamente en la credencial de n8n, nunca en React.

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

## Conexión local Sweet Cost → n8n

En desarrollo, Sweet Cost usa el proxy de Vite `/n8n` para evitar bloqueos CORS del navegador al llamar a n8n en `localhost:5678`.

- Frontend: `VITE_N8N_PROYECCION_URL=/n8n/webhook/sweet-cost/proyeccion`
- Vite reenvía `/n8n/*` a `http://localhost:5678/*`
- El workflow **Sweet Cost - Proyecciones IA** debe estar activo para usar la URL de producción `/webhook/`.

Después de cambiar `.env` o `vite.config.js`, reinicia Vite.
