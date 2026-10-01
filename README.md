# Sweet Cost

Sistema web para gestión de costos, recetas, insumos, cotizaciones, pedidos y personal de pequeños negocios.

## Stack
- React + Vite
- React Router
- JSON Server
- CSS modular por componente/página

## Ejecutar

```bash
npm install
npm run server
```

En otra terminal:

```bash
npm run dev
```

JSON Server usa `http://localhost:3001` y Vite usa el puerto que indique la consola (normalmente `5173`).

## Roles

### Administrador
Puede gestionar productos, insumos, recetas, cotizaciones, pedidos, calendario, empleados, asistencia, configuración y perfil.

### Empleado
Tiene acceso a su dashboard, recetas, cotizaciones, pedidos, calendario y perfil. También puede registrar su entrada y salida desde su dashboard.

## Seguridad de navegación
- `PrivateRoute.jsx` protege las rutas según autenticación, negocio activo y rol.
- `/403` muestra acceso no autorizado.
- `/404` muestra rutas inexistentes.

## Asistencia
Los registros se guardan en la colección `asistencias` de `db.json`, asociados al negocio y al empleado. El administrador puede registrar entrada/salida y editar horarios.

## Notificaciones
El sistema genera avisos para stock bajo/crítico, pedidos próximos, cotizaciones pendientes y estado de pedidos. Se muestra fecha y hora de cada aviso y se actualiza periódicamente.

## Dashboard
El dashboard administrativo muestra ventas realizadas, ganancia, stock en riesgo, pérdidas por cancelación, pendientes, rendimiento mensual, estimación de ingresos, empleado con más gestiones, estados de pedidos y próximas entregas.

> Nota: la estimación de ingresos es una proyección basada en el promedio histórico de ventas realizadas; no constituye un modelo predictivo estadístico.


## Recuperación de contraseña con n8n
La ruta `/recuperar-contrasena` envía un POST al webhook definido en `VITE_N8N_RECUPERACION_URL`. Configura esta variable en `.env` con la URL de tu Webhook de n8n. El frontend no guarda tokens ni contraseñas de recuperación.

## Registro, negocios y recuperación con n8n
- `/registro`: crea una cuenta de administrador y su primer negocio mediante JSON Server.
- `/negocios`: permite al administrador consultar, seleccionar y agregar negocios asociados.
- `/recuperar-contrasena`: envía la solicitud al webhook de n8n definido en `VITE_N8N_RECUPERACION_URL`.
- `/restablecer-contrasena?token=...`: recibe el token enviado por n8n y envía la nueva contraseña al webhook definido en `VITE_N8N_RESTABLECER_URL`.
