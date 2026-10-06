# Puesta en marcha de la versión Supabase

## 1. Variables locales

Copia `.env.example` como `.env` y coloca tu URL y Publishable Key de Supabase.

## 2. Permisos/RLS

En Supabase SQL Editor ejecuta:

```sql
-- contenido de supabase/rls-write-policies.sql
```

Este script:
- otorga permisos al rol `authenticated`;
- conserva RLS;
- permite que el usuario autenticado actualice su propio perfil;
- permite a administradores gestionar empleados dentro de sus negocios;
- permite registrar nuevos negocios administrados por la cuenta actual;
- revoca el permiso de lectura `anon` que se utilizó durante la prueba inicial.

## 3. Edge Functions

Instala/vincula Supabase CLI y despliega:

```bash
supabase functions deploy register-admin
supabase functions deploy manage-employee
```

No copies `SUPABASE_SERVICE_ROLE_KEY` al frontend. Supabase la proporciona a las Edge Functions como secreto del proyecto.

## 4. Recuperación de contraseña

El frontend ahora utiliza:

```js
supabase.auth.resetPasswordForEmail(...)
```

Configura en Supabase Auth → URL Configuration la URL de producción y la URL local de la aplicación. El redirect utilizado por Sweet Cost es `/restablecer-contrasena`.

## 5. Vercel

Configura estas variables en el proyecto de Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Añade también las variables de n8n si vas a utilizar proyecciones IA y el importador de facturas.

## 6. Qué sigue siendo externo

Los servicios de IA de n8n y el tipo de cambio siguen siendo servicios externos. El frontend ya no consulta JSON Server.

Si los workflows de n8n todavía leen `db.json` o `localhost:3001`, esos workflows deben migrarse por separado para consultar Supabase.
