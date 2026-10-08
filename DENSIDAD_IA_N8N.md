# Sweet Cost · Estimación de densidad con IA

El conversor de medidas usa una estrategia híbrida para convertir entre masa y volumen:

1. Densidad guardada en el producto.
2. Densidad aproximada interna para ingredientes comunes.
3. Si no existe ninguna de las anteriores, solicita una estimación a n8n + Groq.
4. La estimación de IA puede guardarse en el producto cuando el usuario la acepta.

La IA nunca recibe ni debe recibir claves secretas desde React. La credencial de Groq permanece en n8n.

## Webhook

- Método: `POST`
- Path: `sweet-cost/densidad`
- Producción: `/webhook/sweet-cost/densidad`
- Prueba: `/webhook-test/sweet-cost/densidad`

El frontend envía:

```json
{
  "accion": "estimar_densidad",
  "producto": {
    "id": "...",
    "nombre": "Harina",
    "marca": "Doña María",
    "tipo": "ingrediente",
    "unidad": "g"
  }
}
```

## Flujo n8n recomendado

```text
Webhook
  ↓
Preparar datos densidad
  ↓
LLM Densidad
  ↓
Parsear densidad
  ↓
Respond to Webhook
```

### Webhook

- HTTP Method: `POST`
- Path: `sweet-cost/densidad`
- Respond: `Using Respond to Webhook Node`

### Preparar datos densidad

Code node:

```javascript
const body = $json.body || $json;
const producto = body.producto || {};

return [{
  json: {
    contexto: `
Eres un asistente especializado en ingredientes de cocina y densidades aproximadas.

Producto: ${producto.nombre || "No especificado"}
Marca: ${producto.marca || "No especificada"}
Tipo: ${producto.tipo || "No especificado"}
Unidad registrada: ${producto.unidad || "No especificada"}

Estima una densidad aproximada en gramos por mililitro (g/ml) que sea razonable para este producto alimenticio.
Si la marca concreta puede cambiar significativamente la densidad, usa un valor representativo y reduce la confianza.
No inventes una precisión innecesaria.
    `.trim()
  }
}];
```

### LLM Densidad

Usa un `Basic LLM Chain` conectado al mismo `Groq Chat Model` que ya utiliza Sweet Cost.

User Message:

```text
{{ $json.contexto }}
```

System Message:

```text
Eres el módulo de estimación de densidad de Sweet Cost.

Tu función es estimar densidades aproximadas de ingredientes y productos alimenticios para permitir conversiones entre masa y volumen.

Devuelve exclusivamente JSON válido, sin Markdown y sin texto adicional.

Estructura obligatoria:
{
  "densidad": 0.0,
  "confianza": "alta|media|baja",
  "fuente": "estimación IA",
  "explicacion": "breve explicación"
}

Reglas:
- densidad debe estar expresada en g/ml.
- Debe ser un número positivo.
- Usa valores razonables para el ingrediente.
- Si existe variación por marca, presentación o compactación, reduce la confianza.
- No afirmes que el valor es exacto.
- Si no puedes producir una estimación razonable, devuelve densidad 0 y confianza baja.
- Responde siempre en español.
```

### Parsear densidad

Code node:

```javascript
const raw = $json.text || $json.output || $json.response || $json.mensaje || $json;

let data;

if (typeof raw === "string") {
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }
} else {
  data = raw;
}

return [{
  json: {
    ok: true,
    densidad: Number(data.densidad) || 0,
    confianza: data.confianza || "baja",
    fuente: data.fuente || "estimación IA",
    explicacion: data.explicacion || "No se proporcionó una explicación."
  }
}];
```

### Respond to Webhook

Response With: `JSON`

Response Body:

```text
{{ JSON.stringify($json) }}
```

## Variable de entorno del frontend

Agregar en Vercel Production:

```text
VITE_N8N_DENSIDAD_URL=https://TU-URL-DEL-TUNEL.trycloudflare.com/webhook/sweet-cost/densidad
```

Con Quick Tunnel la URL cambia cuando se reinicia `cloudflared`, por lo que esta variable debe actualizarse si cambia el hostname.

## Comportamiento en Sweet Cost

- Si el producto ya tiene densidad: se usa directamente.
- Si es un ingrediente común: se usa una densidad aproximada interna sin llamar a IA.
- Si no hay densidad disponible: al convertir masa ↔ volumen, Sweet Cost solicita automáticamente una estimación a n8n.
- La estimación muestra su nivel de confianza.
- El usuario puede guardarla en el producto para futuras conversiones.
- La densidad introducida manualmente siempre tiene prioridad.
