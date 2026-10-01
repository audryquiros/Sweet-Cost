import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/authContext";
import { cargarNegociosDesdeServidor } from "../../context/negocioContext";
import FilterSelect from "../../components/common/FilterSelect";
import "./Negocios.css";

const API = "http://localhost:3001/negocios";
const TIPOS = ["Repostería", "Panadería", "Soda", "Catering"];
const TIPO_OPTIONS = TIPOS.map((tipo) => ({ valor: tipo, nombre: tipo }));
const FORM_INICIAL = { nombre: "", tipo: TIPOS[0], telefono: "", correo: "", margenGanancia: 30 };

export default function Negocios() {
  const { usuario, seleccionarNegocio } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await fetch(API);
      if (!r.ok) throw new Error();
      const data = await r.json();
      const propios = data.filter((negocio) => negocio.administradorId === usuario?.id);
      setNegocios(propios);
    } catch {
      setError("No se pudieron cargar los negocios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [usuario?.id]);

  const negocioEditando = useMemo(
    () => negocios.find((negocio) => negocio.id === editandoId) || null,
    [negocios, editandoId]
  );

  const administrar = (negocio) => {
    if (seleccionarNegocio(negocio)) {
      setMsg(`Ahora estás administrando ${negocio.nombre}.`);
      setError("");
    }
  };

  const comenzarEdicion = (negocio) => {
    setEditandoId(negocio.id);
    setForm({
      nombre: negocio.nombre || "",
      tipo: negocio.tipo || TIPOS[0],
      telefono: negocio.telefono || "",
      correo: negocio.correo || "",
      margenGanancia: negocio.margenGanancia ?? 30,
    });
    setMsg("");
    setError("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setMsg("");
    setError("");
    setGuardando(true);

    const datos = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      telefono: form.telefono.trim(),
      correo: form.correo.trim().toLowerCase(),
      margenGanancia: Number(form.margenGanancia),
    };

    try {
      const url = editandoId ? `${API}/${editandoId}` : API;
      const method = editandoId ? "PATCH" : "POST";
      const payload = editandoId
        ? datos
        : { ...datos, id: `neg-${Date.now()}`, administradorId: usuario.id };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();

      const negocioGuardado = await response.json();
      setNegocios((actuales) => editandoId
        ? actuales.map((item) => item.id === negocioGuardado.id ? negocioGuardado : item)
        : [...actuales, negocioGuardado]
      );

      if (editandoId && usuario?.negocioId === negocioGuardado.id) {
        seleccionarNegocio(negocioGuardado);
      }

      if (!editandoId) {
        const ids = [...new Set([...(usuario?.negocioIds || []), negocioGuardado.id])];
        const empleadoResponse = await fetch(`http://localhost:3001/empleados/${usuario.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ negocioId: negocioGuardado.id, negocioIds: ids }),
        });
        if (!empleadoResponse.ok) throw new Error();

        const actualizado = { ...usuario, negocioId: negocioGuardado.id, negocioIds: ids };
        sessionStorage.setItem("sweetcost-auth-user", JSON.stringify(actualizado));
        window.dispatchEvent(new CustomEvent("sweetcost-auth-cambio", { detail: actualizado }));
        seleccionarNegocio(negocioGuardado);
      }

      setForm(FORM_INICIAL);
      setEditandoId(null);
      setMsg(editandoId ? "Los datos del negocio se actualizaron correctamente." : "Negocio registrado y asociado a tu cuenta.");
      await cargarNegociosDesdeServidor();
    } catch {
      setError(editandoId
        ? "No se pudo actualizar el negocio. Verifica que JSON Server esté activo."
        : "No se pudo registrar el negocio. Verifica que JSON Server esté activo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="negocios-page">
      <header className="negocios-header">
        <span>MIS NEGOCIOS</span>
        <h1>Gestiona tus negocios</h1>
        <p>Agrega nuevos negocios, actualiza sus datos o cambia cuál quieres administrar sin salir del sistema.</p>
      </header>

      {msg && <div className="negocios-message negocios-message--success">{msg}</div>}
      {error && <div className="negocios-message negocios-message--error">{error}</div>}

      <div className="negocios-layout">
        <section className="negocios-list">
          <div className="negocios-section-heading">
            <div><h2>Tus negocios</h2><p>{negocios.length} {negocios.length === 1 ? "negocio asociado" : "negocios asociados"}</p></div>
          </div>

          {cargando ? (
            <div className="negocios-empty">Cargando negocios...</div>
          ) : negocios.length ? negocios.map((negocio) => (
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
                <button type="button" className="negocio-card-edit" onClick={() => comenzarEdicion(negocio)}>Editar</button>
              </div>
            </article>
          )) : <div className="negocios-empty">No hay negocios asociados.</div>}
        </section>

        <form className="negocio-form" onSubmit={guardar}>
          <div>
            <span className="negocio-form-eyebrow">{negocioEditando ? "EDITAR NEGOCIO" : "NUEVO NEGOCIO"}</span>
            <h2>{negocioEditando ? "Editar negocio" : "Agregar negocio"}</h2>
            <p>{negocioEditando ? "Actualiza los datos del negocio que administras." : "El nuevo negocio quedará vinculado a tu cuenta de administrador."}</p>
          </div>
          <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
          <label>Tipo de negocio<FilterSelect id="tipo-negocio" value={form.tipo} options={TIPO_OPTIONS} onChange={(value) => setForm({ ...form, tipo: value })} portalMenu /></label>
          <label>Teléfono<input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="0000-0000" /></label>
          <label>Correo<input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></label>
          <label>Margen de ganancia (%)<input type="number" min="0" max="100" value={form.margenGanancia} onChange={(e) => setForm({ ...form, margenGanancia: e.target.value })} /></label>
          <div className="negocio-form-actions">
            {negocioEditando && <button type="button" className="negocio-form-cancel" onClick={cancelarEdicion} disabled={guardando}>Cancelar</button>}
            <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : negocioEditando ? "Guardar cambios" : "Registrar negocio"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
