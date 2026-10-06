import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(request)=>{
 if(request.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(request.method!=="POST")return out({error:"Método no permitido."},405);
 const token=(request.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(!token)return out({error:"No autenticado."},401);
 const url=Deno.env.get("SUPABASE_URL")!; const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const admin=createClient(url,serviceKey,{auth:{persistSession:false}});
 const {data:{user:caller},error:callerError}=await admin.auth.getUser(token);
 if(callerError||!caller)return out({error:"Sesión no válida."},401);
 const {data:callerEmployee}=await admin.from("empleados").select("id, rol, estado").eq("auth_user_id",caller.id).maybeSingle();
 if(!callerEmployee||callerEmployee.estado!=="activo"||!["admin","administrador"].includes(String(callerEmployee.rol).toLowerCase()))return out({error:"No tienes permisos de administrador."},403);
 const {data:callerMemberships}=await admin.from("empleado_negocios").select("negocio_id").eq("empleado_id",callerEmployee.id);
 const callerBusinessIds=(callerMemberships||[]).map((r:any)=>r.negocio_id);
 const employeeBelongsToCallerBusiness=async(empleadoId:string)=>{
  const {data:targetMemberships}=await admin.from("empleado_negocios").select("negocio_id").eq("empleado_id",empleadoId);
  return (targetMemberships||[]).some((r:any)=>callerBusinessIds.includes(r.negocio_id));
 };
 const body=await request.json().catch(()=>({})); const action=body.action;
 if(action==="create"){
  const {empleado,negocioIds=[],password}=body;
  const ids=[...new Set(negocioIds)];
  if(!empleado?.correo||!password||password.length<6||!ids.length)return out({error:"Datos incompletos para crear el empleado."},400);
  const {data:memberships}=await admin.from("empleado_negocios").select("negocio_id").eq("empleado_id",callerEmployee.id).in("negocio_id",ids);
  if((memberships||[]).length!==ids.length)return out({error:"No puedes asignar el empleado a uno de esos negocios."},403);
  const {data:authData,error:authError}=await admin.auth.admin.createUser({email:empleado.correo,password,email_confirm:true});
  if(authError||!authData.user)return out({error:authError?.message||"No se pudo crear la cuenta de acceso."},400);
  const empleadoId=empleado.id; const principal=ids[0];
  const {data:profile,error:profileError}=await admin.from("empleados").insert({id:empleadoId,auth_user_id:authData.user.id,nombre:empleado.nombre,correo:empleado.correo,telefono:empleado.telefono||null,rol:empleado.rol||"empleado",estado:empleado.estado||"activo",foto:empleado.foto||"/illustrations/perfil.png",negocio_id:principal}).select("*").single();
  if(profileError){await admin.auth.admin.deleteUser(authData.user.id);return out({error:profileError.message},400);}
  const {error:relationError}=await admin.from("empleado_negocios").insert(ids.map((negocioId:string)=>({empleado_id:empleadoId,negocio_id:negocioId})));
  if(relationError){await admin.from("empleados").delete().eq("id",empleadoId);await admin.auth.admin.deleteUser(authData.user.id);return out({error:relationError.message},400);}
  return out({...profile,auth_user_id:authData.user.id,negocioIds:ids});
 }
 if(action==="delete_business"){
  const { negocioId }=body;
  if(!negocioId)return out({error:"Negocio no identificado."},400);
  const { data:membership }=await admin.from("empleado_negocios").select("negocio_id").eq("empleado_id",callerEmployee.id).eq("negocio_id",negocioId).maybeSingle();
  if(!membership)return out({error:"No tienes acceso a este negocio."},403);
  const { data:adminBusinesses }=await admin.from("empleado_negocios").select("negocio_id").eq("empleado_id",callerEmployee.id);
  const remaining=(adminBusinesses||[]).map((r:any)=>r.negocio_id).filter((id:string)=>id!==negocioId);
  const { error:deleteBusinessError }=await admin.from("negocios").delete().eq("id",negocioId);
  if(deleteBusinessError)return out({error:deleteBusinessError.message},400);
  if(remaining.length===0){
    await admin.from("empleados").delete().eq("id",callerEmployee.id);
    await admin.auth.admin.deleteUser(caller.id);
    return out({ok:true,cuentaEliminada:true,negociosRestantes:[]});
  }
  const { data:restantes }=await admin.from("negocios").select("*").in("id",remaining);
  return out({ok:true,cuentaEliminada:false,negociosRestantes:restantes||[]});
 }

 if(action==="update_password"){
  const {empleadoId,password}=body; if(!empleadoId||!password||password.length<6)return out({error:"Contraseña inválida."},400);
  if(!(await employeeBelongsToCallerBusiness(empleadoId)))return out({error:"No puedes administrar un empleado que no pertenece a tus negocios."},403);
  const {data:employee}=await admin.from("empleados").select("auth_user_id").eq("id",empleadoId).maybeSingle();
  if(!employee?.auth_user_id)return out({error:"El empleado no tiene una cuenta Auth vinculada."},400);
  const {error}=await admin.auth.admin.updateUserById(employee.auth_user_id,{password}); if(error)return out({error:error.message},400); return out({ok:true});
 }
 if(action==="delete"){
  const {empleadoId}=body; if(!empleadoId||empleadoId===callerEmployee.id)return out({error:"No se puede eliminar esta cuenta desde este flujo."},400);
  if(!(await employeeBelongsToCallerBusiness(empleadoId)))return out({error:"No puedes eliminar un empleado que no pertenece a tus negocios."},403);
  const {data:employee}=await admin.from("empleados").select("auth_user_id").eq("id",empleadoId).maybeSingle(); if(!employee)return out({error:"Empleado no encontrado."},404);
  const {error:profileError}=await admin.from("empleados").delete().eq("id",empleadoId); if(profileError)return out({error:profileError.message},400);
  if(employee.auth_user_id)await admin.auth.admin.deleteUser(employee.auth_user_id); return out({ok:true});
 }
 return out({error:"Acción no válida."},400);
});
