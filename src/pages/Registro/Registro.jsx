import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterSelect from "../../components/common/FilterSelect";
import "../Login/Login.css";
import "./Registro.css";

const E = "http://localhost:3001/empleados";
const N = "http://localhost:3001/negocios";

const tipos = [
  { valor: "Repostería", nombre: "Repostería" },
  { valor: "Panadería", nombre: "Panadería" },
  { valor: "Soda", nombre: "Soda" },
  { valor: "Catering", nombre: "Catering" },
];


export default function Registro() {
  const nav = useNavigate();
  const [f, setF] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    clave: "",
    confirmar: "",
    negocio: "",
    tipo: tipos[0].valor,
    telNeg: "",
    correoNeg: "",
  });
  const [estado, setEstado] = useState("idle");
  const [msg, setMsg] = useState("");

  const ch = (e) => setF((actual) => ({ ...actual, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (f.clave.length < 6) return setMsg("La contraseña debe tener al menos 6 caracteres.");
    if (f.clave !== f.confirmar) return setMsg("Las contraseñas no coinciden.");

    setEstado("loading");

    try {
      const q = await fetch(`${E}?correo=${encodeURIComponent(f.correo.trim())}`);
      const xs = await q.json();

      if (xs.some((x) => x.correo?.toLowerCase() === f.correo.trim().toLowerCase())) {
        throw Error("Ya existe una cuenta con ese correo.");
      }

      // El ID real del administrador debe ser el que devuelve JSON Server.
      // No confiamos en un ID generado por el frontend porque JSON Server puede
      // generar/sobrescribir el ID al crear el registro.
      const empleado = {
        nombre: f.nombre.trim(),
        correo: f.correo.trim().toLowerCase(),
        telefono: f.telefono.trim(),
        rol: "administrador",
        estado: "activo",
        foto: "/illustrations/perfil.png",
        negocioId: null,
        negocioIds: [],
        clave: f.clave,
      };

      let empleadoCreado = null;
      let negocioCreado = null;

      try {
        // 1. Crear primero el administrador y tomar SU ID REAL.
        const re = await fetch(E, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(empleado),
        });

        if (!re.ok) throw Error("No se pudo crear la cuenta de administrador.");
        empleadoCreado = await re.json();

        const administradorId = empleadoCreado.id;
        if (!administradorId) {
          throw Error("JSON Server no devolvió el ID del administrador.");
        }

        // 2. Crear el negocio usando EXACTAMENTE el ID que devolvió el empleado.
        const negocio = {
          nombre: f.negocio.trim(),
          tipo: f.tipo,
          telefono: f.telNeg.trim(),
          correo: f.correoNeg.trim() || f.correo.trim(),
          margenGanancia: 30,
          administradorId,
        };

        const rn = await fetch(N, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(negocio),
        });

        if (!rn.ok) throw Error("No se pudo guardar el negocio.");
        negocioCreado = await rn.json();

        const negocioId = negocioCreado.id;
        if (!negocioId) {
          throw Error("JSON Server no devolvió el ID del negocio.");
        }

        // 3. Completar la asociación del administrador con el ID REAL del negocio.
        const empleadoActualizadoResponse = await fetch(`${E}/${administradorId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            negocioId,
            negocioIds: [negocioId],
          }),
        });

        if (!empleadoActualizadoResponse.ok) {
          throw Error("No se pudo asociar el negocio con la cuenta de administrador.");
        }

        // 4. Verificación final: si la relación no quedó bien guardada,
        // hacemos rollback de AMBOS registros.
        const [empleadoVerificacionResponse, negocioVerificacionResponse] = await Promise.all([
          fetch(`${E}/${administradorId}`),
          fetch(`${N}/${negocioId}`),
        ]);

        if (!empleadoVerificacionResponse.ok || !negocioVerificacionResponse.ok) {
          throw Error("No se pudo verificar la asociación del negocio con el administrador.");
        }

        const empleadoVerificado = await empleadoVerificacionResponse.json();
        const negocioVerificado = await negocioVerificacionResponse.json();

        const asociacionCorrecta =
          negocioVerificado.administradorId === administradorId &&
          empleadoVerificado.negocioId === negocioId &&
          Array.isArray(empleadoVerificado.negocioIds) &&
          empleadoVerificado.negocioIds.includes(negocioId);

        if (!asociacionCorrecta) {
          throw Error("La cuenta y el negocio no pudieron asociarse correctamente.");
        }
      } catch (error) {
        // JSON Server no ofrece transacciones. Si cualquier paso falla,
        // eliminamos lo que sí alcanzó a crearse para no dejar datos huérfanos.
        if (negocioCreado?.id) {
          await fetch(`${N}/${encodeURIComponent(negocioCreado.id)}`, {
            method: "DELETE",
          }).catch(() => {});
        }

        if (empleadoCreado?.id) {
          await fetch(`${E}/${encodeURIComponent(empleadoCreado.id)}`, {
            method: "DELETE",
          }).catch(() => {});
        }

        throw error;
      }

      setEstado("success");
      setMsg("Cuenta y negocio registrados correctamente.");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (err) {
      setEstado("error");
      setMsg(err.message || "No se pudo completar el registro. Verifica JSON Server.");
    }
  };

  return (
    <main className="registro-page login-page">
      <div className="registro-content login-content">
        <section className="registro-brand-card login-brand-card">
          <Link to="/login" className="registro-brand-logo login-brand-logo" aria-label="Volver al inicio de sesión">
            <img src="/logoSC.png" alt="Sweet Cost" />
          </Link>

          <p className="registro-brand-title login-brand-title">
            Organiza tu negocio, controla tus costos y administra toda tu operación desde un solo lugar.
          </p>

          <div className="login-brand-features" aria-label="Beneficios de Sweet Cost">
            <div className="login-brand-feature">
              <img src="/illustrations/productos-cupcake.png" alt="" />
              <span>Costos</span>
            </div>
            <div className="login-brand-feature">
              <img src="/illustrations/recetas-batidor.png" alt="" />
              <span>Recetas</span>
            </div>
            <div className="login-brand-feature">
              <img src="/illustrations/pedidos-portapapeles.png" alt="" />
              <span>Pedidos</span>
            </div>
          </div>
        </section>

        <section className="registro-card login-card">
          <div className="registro-heading login-heading">
            <h1>Registra tu negocio</h1>
            <p>Configura tu cuenta de administrador y deja listo tu primer negocio en Sweet Cost.</p>
          </div>

          <form onSubmit={submit} className="registro-form login-form">
            <div className="registro-section">
              <h2>Datos personales</h2>
              <div className="registro-grid">
                <label className="login-field">
                  <span>Nombre completo</span>
                  <input name="nombre" value={f.nombre} onChange={ch} autoComplete="name" required />
                </label>

                <label className="login-field">
                  <span>Correo electrónico</span>
                  <input type="email" name="correo" value={f.correo} onChange={ch} autoComplete="email" required />
                </label>

                <label className="login-field">
                  <span>Teléfono</span>
                  <input name="telefono" value={f.telefono} onChange={ch} placeholder="0000-0000" autoComplete="tel" />
                </label>

                <label className="login-field">
                  <span>Contraseña</span>
                  <input type="password" name="clave" value={f.clave} onChange={ch} minLength="6" autoComplete="new-password" required />
                </label>

                <label className="login-field registro-confirm-password">
                  <span>Confirmar contraseña</span>
                  <input type="password" name="confirmar" value={f.confirmar} onChange={ch} autoComplete="new-password" required />
                </label>
              </div>
            </div>

            <div className="registro-section">
              <h2>Datos del negocio</h2>
              <div className="registro-grid">
                <label className="login-field">
                  <span>Nombre del negocio</span>
                  <input name="negocio" value={f.negocio} onChange={ch} autoComplete="organization" required />
                </label>

                <FilterSelect
                  id="registro-tipo-negocio"
                  label="Tipo de negocio"
                  value={f.tipo}
                  options={tipos}
                  onChange={(value) => setF((actual) => ({ ...actual, tipo: value }))}
                  className="registro-business-select"
                  portalMenu
                />

                <label className="login-field">
                  <span>Teléfono del negocio</span>
                  <input name="telNeg" value={f.telNeg} onChange={ch} placeholder="0000-0000" autoComplete="tel" />
                </label>

                <label className="login-field">
                  <span>Correo del negocio</span>
                  <input type="email" name="correoNeg" value={f.correoNeg} onChange={ch} autoComplete="email" />
                </label>
              </div>
            </div>

            {msg && <p className={`registro-msg ${estado}`}>{msg}</p>}

            <button type="submit" className="login-submit registro-submit" disabled={estado === "loading"}>
              {estado === "loading" ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <Link to="/login" className="registro-back">
            Ya tengo una cuenta · Iniciar sesión
          </Link>
        </section>
      </div>
    </main>
  );
}
