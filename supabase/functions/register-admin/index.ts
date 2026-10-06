import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(request)=>{
 if(request.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(request.method!=="POST")return out({error:"Método no permitido."},405);
 const body=await request.json().catch(()=>({}));
 const {nombre,correo,telefono,password,negocio,tipo,telNeg,correoNeg}=body;
 if(!nombre||!correo||!password||password.length<6||!negocio||!tipo)return out({error:"Completa todos los campos requeridos."},400);
 const url=Deno.env.get("SUPABASE_URL")!; const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const admin=createClient(url,key,{auth:{persistSession:false}});
 const {data:authData,error:authError}=await admin.auth.admin.createUser({email:correo,password,email_confirm:true});
 if(authError||!authData.user)return out({error:authError?.message||"No se pudo crear la cuenta."},400);
 const empleadoId=crypto.randomUUID(); const negocioId=crypto.randomUUID();
 const {error:employeeError}=await admin.from("empleados").insert({id:empleadoId,auth_user_id:authData.user.id,nombre,correo,telefono:telefono||null,rol:"administrador",estado:"activo",foto:"/illustrations/perfil.png",negocio_id:negocioId});
 if(employeeError){await admin.auth.admin.deleteUser(authData.user.id);return out({error:employeeError.message},400);}
 const {error:businessError}=await admin.from("negocios").insert({id:negocioId,nombre:negocio,tipo,telefono:telNeg||null,correo:correoNeg||correo,margen_ganancia:30,administrador_id:empleadoId});
 if(businessError){await admin.from("empleados").delete().eq("id",empleadoId);await admin.auth.admin.deleteUser(authData.user.id);return out({error:businessError.message},400);}
 const {error:relationError}=await admin.from("empleado_negocios").insert({empleado_id:empleadoId,negocio_id:negocioId});
 if(relationError){await admin.from("negocios").delete().eq("id",negocioId);await admin.from("empleados").delete().eq("id",empleadoId);await admin.auth.admin.deleteUser(authData.user.id);return out({error:relationError.message},400);}
 return out({ok:true,empleadoId,negocioId});
});
