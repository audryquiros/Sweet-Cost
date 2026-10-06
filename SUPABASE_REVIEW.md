# Revisión de la adaptación a Supabase

## Correcciones realizadas

- Los registros nuevos de productos, insumos, recetas, cotizaciones, pedidos, negocios, facturas y asistencias ahora reciben siempre un UUID nuevo al crear.
- La actualización conserva el ID del registro que se está editando.
- La creación de empleados también fuerza un ID nuevo antes de enviarlo a la Edge Function.
- Se revisaron las referencias al antiguo JSON Server dentro de `src`: no quedan llamadas a `localhost:3001`, `/api/...` ni consultas directas al JSON Server.
- Se revisaron los servicios principales y sus imports desde las páginas para confirmar que el frontend utiliza las capas de servicios adaptadas a Supabase.
- Se reforzó `manage-employee` para que un administrador solo pueda cambiar contraseñas o eliminar empleados que pertenezcan al menos a uno de sus negocios.
- No se incorporan contraseñas ni tokens de recuperación provenientes del dataset original.

## Validaciones realizadas

- Los archivos JavaScript de servicios modificados pasan `node --check`.
- La conexión, autenticación y carga del dashboard ya habían sido verificadas en el entorno del proyecto antes de esta corrección.
- El error observado al crear productos (`409 duplicate key ... productos_pkey`) se relacionaba con el ID enviado en la operación de inserción; la creación ahora genera un ID nuevo independientemente de si el objeto recibido contiene un ID anterior.

## Nota sobre la compilación

En este entorno no se pudo completar `npm ci` dentro del tiempo disponible, por lo que no se ejecutó `vite build` aquí. El proyecto conserva su `package-lock.json` y no se incluyeron `node_modules` en el ZIP.

## Después de reemplazar el proyecto

Si ya tienes desplegadas las Edge Functions, vuelve a desplegar `manage-employee` para que la corrección de permisos quede activa:

```bash
supabase functions deploy manage-employee
```


## Revisión adicional — eliminación de insumos

- `src/services/insumoServices.js` ahora comprueba relaciones con `cotizacion_insumos` y `pedido_insumos` antes de eliminar.
- `src/pages/Insumos/Insumos.jsx` muestra una confirmación amigable cuando el insumo está siendo utilizado.
- Si está en cotizaciones, ofrece ir a Cotizaciones.
- Si está en pedidos, ofrece ir a Pedidos.
- Si está en ambos, ofrece ambas rutas.
- Se mantiene la restricción de clave foránea de Supabase como protección final.
- Los errores técnicos de clave foránea se transforman en un mensaje comprensible para el usuario.
