# Sweet Cost

Versión de Sweet Cost adaptada para trabajar con **Supabase** como backend principal.

## Arquitectura

- React + Vite
- Supabase Auth para autenticación
- Supabase PostgreSQL para datos
- Row Level Security (RLS) para aislamiento por negocio
- n8n únicamente para los flujos de IA que ya utiliza el proyecto
- Frankfurter para el tipo de cambio USD/CRC de referencia

La aplicación ya no consulta `localhost:3001` ni utiliza JSON Server en tiempo de ejecución.

## Modelo de datos

- `productos` = ingredientes y materias primas.
- `insumos` = empaques, envases y materiales desechables.
- `recetas` = receta principal + `receta_ingredientes`.
- `cotizaciones` = cotización + `cotizacion_insumos`.
- `pedidos` = pedido + `pedido_insumos`.

Se conservan los IDs originales de los datos migrados.

## Variables de entorno

Copia `.env.example` a `.env` y configura:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

Las variables de n8n son opcionales y dependen de los workflows que se mantengan activos.

**No subas `.env` a Git.**

## Supabase

El esquema y los datos ya fueron preparados previamente.

Este proyecto incluye:

- `supabase/rls-write-policies.sql`: permisos del rol `authenticated` y políticas de escritura necesarias para el cliente.
- `supabase/functions/register-admin`: creación segura de una cuenta de administrador + primer negocio.
- `supabase/functions/manage-employee`: creación, cambio de contraseña y eliminación de cuentas de empleados.

Las Edge Functions necesitan `SUPABASE_SERVICE_ROLE_KEY` únicamente en el entorno de Supabase. **Nunca debe colocarse en React ni en `.env` del frontend.**

## Edge Functions

Desde la CLI de Supabase, después de vincular el proyecto:

```bash
supabase functions deploy register-admin
supabase functions deploy manage-employee
```

Las funciones usan automáticamente `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` proporcionadas por Supabase.

## Datos legacy

`legacy/db.json` conserva una copia del origen JSON utilizado durante la migración. No es utilizado por la aplicación.

No se migraron contraseñas ni tokens de recuperación del JSON original. Las contraseñas son responsabilidad de Supabase Auth.

## Desarrollo

```bash
npm install
npm run dev
```

## Producción / Vercel

Configura en Vercel las mismas variables de entorno del frontend y despliega la rama conectada al proyecto.

Las Edge Functions no se despliegan con Vercel; pertenecen al proyecto de Supabase.
