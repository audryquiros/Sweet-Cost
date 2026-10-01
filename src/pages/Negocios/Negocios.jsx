import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { cargarNegociosDesdeServidor } from "../../context/negocioContext";
import FilterSelect from "../../components/common/FilterSelect";
import "./Negocios.css";

const API = "http://localhost:3001/negocios";
const EMP = "http://localhost:3001/empleados";
const TIPOS = ["Repostería", "Panadería", "Soda", "Catering"];
const TIPO_OPTIONS = TIPOS.map((tipo) => ({ valor: tipo, nombre: tipo }));

const FORM_INICIAL = { nombre: "", tipo: TIPOS[0], telefono: "", correo: "", margenGanancia: 30 };

export default function Negocios() {
  const { usuario, seleccionarNegocio } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const cargar = async () => {
    const r = await fetch(API);
    if (!r.ok) throw new Error();
    const data = await r.json();
    const ids = new Set(usuario?.negocioIds || []);

    if (usuario?.id) {
      data.forEach((negocio) => {
        if (negocio.administradorId === usuario.id) ids.add(negocio.id);
      });
    }

    setNegocios(data.filter((negocio) => ids.has(negocio.id)));
  };

  useEffect(() => {
    cargar().catch(() => setError("No se pudieron cargar los negocios."));
  }, [usuario?.id, usuario?.negocioIds?.join(",")]);

  const administrar = (negocio) => {
    if (seleccionarNegocio(negocio)) {
      setMsg(`Ahora estás administrando ${negocio.nombre}.`);
      setError("");
    }
  };

  const crear = async (event) => {
    event.preventDefault();
    setMsg("");
    setError("");
    const id = `neg-${Date.now()}`;
    const negocio = {
      ...form,
      id,
      administradorId: usuario.id,
      margenGanancia: Number(form.margenGanancia),
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(negocio),
      });
      if (!response.ok) throw new Error();
      const negocioGuardado = await response.json();

      const ids = [...new Set([...(usuario.negocioIds || []), negocioGuardado.id])];
      const empleadoResponse = await fetch(`${EMP}/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId: negocioGuardado.id, negocioIds: ids }),
      });
      if (!empleadoResponse.ok) throw new Error();

      const actualizado = { ...usuario, negocioId: negocioGuardado.id, negocioIds: ids };
      sessionStorage.setItem("sweetcost-auth-user", JSON.stringify(actualizado));
      window.dispatchEvent(new CustomEvent("sweetcost-auth-cambio", { detail: actualizado }));
      setNegocios((actuales) => [
        ...actuales.filter((item) => item.id !== negocioGuardado.id),
        negocioGuardado,
      ]);
      seleccionarNegocio(negocioGuardado);
      setForm(FORM_INICIAL);
      setMsg("Negocio registrado y asociado a tu cuenta.");
      await cargarNegociosDesdeServidor();
    } catch {
      setError("No se pudo registrar el negocio. Verifica que JSON Server esté activo.");
    }
  };

  return (
    <main className="negocios-page">
      <header className="negocios-header">
        <span>MIS NEGOCIOS</span>
        <h1>Gestiona tus negocios</h1>
        <p>Agrega nuevos negocios o cambia cuál quieres administrar sin salir del sistema.</p>
      </header>

      {msg && <div className="negocios-message negocios-message--success">{msg}</div>}
      {error && <div className="negocios-message negocios-message--error">{error}</div>}

      <div className="negocios-layout">
        <section className="negocios-list">
          <div className="negocios-section-heading">
            <div><h2>Tus negocios</h2><p>{negocios.length} {negocios.length === 1 ? "negocio asociado" : "negocios asociados"}</p></div>
          </div>
          {negocios.length ? negocios.map((negocio) => (
            <article className={`negocio-card ${usuario?.negocioId === negocio.id ? "activo" : ""}`} key={negocio.id}>
              <div className="negocio-card-main">
                <span className="negocio-card-badge">{negocio.tipo}</span>
                <h2>{negocio.nombre}</h2>
                <p>{negocio.correo || "Sin correo"}</p>
                <p>{negocio.telefono || "Sin teléfono"}</p>
              </div>
              <div className="negocio-card-actions">
                {usuario?.negocioId === negocio.id && <span className="negocio-activo-label">Negocio activo</span>}
                <button type="button" onClick={() => administrar(negocio)}>Administrar</button>
              </div>
            </article>
          )) : <div className="negocios-empty">No hay negocios asociados.</div>}
        </section>

        <form className="negocio-form" onSubmit={crear}>
          <div><span className="negocio-form-eyebrow">NUEVO NEGOCIO</span><h2>Agregar negocio</h2><p>El nuevo negocio quedará vinculado a tu cuenta de administrador.</p></div>
          <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
          <label>Tipo de negocio<FilterSelect id="tipo-negocio" value={form.tipo} options={TIPO_OPTIONS} onChange={(value) => setForm({ ...form, tipo: value })} portalMenu /></label>
          <label>Teléfono<input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="0000-0000" /></label>
          <label>Correo<input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></label>
          <label>Margen de ganancia (%)<input type="number" min="0" max="100" value={form.margenGanancia} onChange={(e) => setForm({ ...form, margenGanancia: e.target.value })} /></label>
          <button type="submit">Registrar negocio</button>
        </form>
      </div>
    </main>
  );
}
