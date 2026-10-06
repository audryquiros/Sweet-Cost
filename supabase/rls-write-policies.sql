-- Sweet Cost - permisos necesarios para el cliente React con Supabase Auth.
-- Ejecutar DESPUÉS del schema/RLS inicial.
-- No desactiva RLS.

-- El cliente usa el rol authenticated después del login.
grant select, insert, update, delete on table
  public.negocios,
  public.empleados,
  public.empleado_negocios,
  public.productos,
  public.insumos,
  public.recetas,
  public.receta_ingredientes,
  public.cotizaciones,
  public.cotizacion_insumos,
  public.pedidos,
  public.pedido_insumos,
  public.asistencias,
  public.facturas
  to authenticated;

-- La prueba inicial usó anon. Ya no lo necesitamos.
revoke select on public.negocios from anon;

-- Empleados: un usuario puede modificar su propio perfil; un administrador
-- puede administrar empleados dentro de sus negocios.
drop policy if exists empleados_insert on public.empleados;
create policy empleados_insert
on public.empleados
for insert
with check (
  auth.uid() = auth_user_id
  or (public.is_admin() and public.is_business_member(negocio_id))
);

drop policy if exists empleados_update on public.empleados;
create policy empleados_update
on public.empleados
for update
using (
  auth.uid() = auth_user_id
  or (public.is_admin() and public.is_business_member(negocio_id))
)
with check (
  auth.uid() = auth_user_id
  or (public.is_admin() and public.is_business_member(negocio_id))
);

drop policy if exists empleados_delete on public.empleados;
create policy empleados_delete
on public.empleados
for delete
using (public.is_admin() and public.is_business_member(negocio_id));

-- Relaciones empleado-negocio.
drop policy if exists empleado_negocios_insert on public.empleado_negocios;
create policy empleado_negocios_insert
on public.empleado_negocios
for insert
with check (
  exists (
    select 1
    from public.empleados e
    where e.id = empleado_id
      and e.auth_user_id = auth.uid()
  )
  or (public.is_admin() and public.is_business_member(negocio_id))
);

drop policy if exists empleado_negocios_update on public.empleado_negocios;
create policy empleado_negocios_update
on public.empleado_negocios
for update
using (public.is_admin() and public.is_business_member(negocio_id))
with check (public.is_admin() and public.is_business_member(negocio_id));

drop policy if exists empleado_negocios_delete on public.empleado_negocios;
create policy empleado_negocios_delete
on public.empleado_negocios
for delete
using (public.is_admin() and public.is_business_member(negocio_id));

-- Negocios.
drop policy if exists negocios_insert on public.negocios;
create policy negocios_insert
on public.negocios
for insert
with check (
  public.is_admin()
  and administrador_id = (
    select e.id from public.empleados e
    where e.auth_user_id = auth.uid()
    limit 1
  )
);

drop policy if exists negocios_delete on public.negocios;
create policy negocios_delete
on public.negocios
for delete
using (public.is_admin() and public.is_business_member(id));
