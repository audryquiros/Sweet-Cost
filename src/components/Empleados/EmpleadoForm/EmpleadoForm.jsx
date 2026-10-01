import { useEffect, useMemo, useState } from "react";
import FilterSelect from "../../common/FilterSelect";
import { createEmpleado, updateEmpleado } from "../../../services/empleadoServices";
import { getNegocioActivoId } from "../../../context/negocioContext";
import { useAuth } from "../../../context/authContext";
import "./EmpleadoForm.css";
import { formatearTelefono, telefonoCompleto } from "../../../utils/formatearTelefono";

const API_NEGOCIOS = "http://localhost:3001/negocios";

const formularioInicial = {
  nombre: "",
  correo: "",
  telefono: "",
  rol: "empleado",
  estado: "activo",
  clave: "",
};

const ROLES = [
  { valor: "empleado", nombre: "Empleado" },
  { valor: "administrador", nombre: "Administrador" },
];

const ESTADOS = [
  { valor: "activo", nombre: "Activo" },
  { valor: "inactivo", nombre: "Inactivo" },
];

function EmpleadoForm({ empleado, onCreado, onActualizado, onCancelar }) {
  const { usuario } = useAuth();
  const [formulario, setFormulario] = useState(formularioInicial);
  const [negociosAdministrados, setNegociosAdministrados] = useState([]);
  const [negociosSeleccionados, setNegociosSeleccionados] = useState([]);
  const [cargandoNegocios, setCargandoNegocios] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const puedeAsignarVariosNegocios = usuario?.rol === "administrador" && negociosAdministrados.length > 1;

  useEffect(() => {
    if (empleado) {
      setFormulario({
        nombre: empleado.nombre || "",
        correo: empleado.correo || "",
        telefono: formatearTelefono(empleado.telefono || ""),
        rol: empleado.rol || "empleado",
        estado: empleado.estado || "activo",
        clave: "",
      });
    } else {
      setFormulario(formularioInicial);
    }
    setError("");
  }, [empleado]);

  useEffect(() => {
    let cancelado = false;

    const cargarNegocios = async () => {
      if (usuario?.rol !== "administrador" || !usuario?.id) {
        setNegociosAdministrados([]);
        return;
      }

      setCargandoNegocios(true);
      try {
        const response = await fetch(API_NEGOCIOS);
        if (!response.ok) throw new Error();
        const data = await response.json();
        const propios = data.filter((negocio) => negocio.administradorId === usuario.id);
        if (cancelado) return;

        setNegociosAdministrados(propios);

        const idsEmpleado = Array.isArray(empleado?.negocioIds) && empleado.negocioIds.length
          ? empleado.negocioIds
          : empleado?.negocioId
            ? [empleado.negocioId]
            : [getNegocioActivoId()];

        const validos = idsEmpleado.filter((id) => propios.some((negocio) => negocio.id === id));
        const seleccionInicial = validos.length ? validos : (propios[0]?.id ? [propios[0].id] : []);
        setNegociosSeleccionados([...new Set(seleccionInicial)]);
      } catch {
        if (!cancelado) {
          setNegociosAdministrados([]);
          setNegociosSeleccionados([getNegocioActivoId()]);
        }
      } finally {
        if (!cancelado) setCargandoNegocios(false);
      }
    };

    cargarNegocios();
    return () => { cancelado = true; };
  }, [usuario?.id, usuario?.rol, empleado?.id]);

  const negocioActivoId = getNegocioActivoId();

  const negociosParaMostrar = useMemo(() => {
    if (puedeAsignarVariosNegocios) return negociosAdministrados;
    return negociosAdministrados.slice(0, 1);
  }, [negociosAdministrados, puedeAsignarVariosNegocios]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const valorFormateado = name === "telefono" ? formatearTelefono(value) : value;
    setFormulario((actual) => ({ ...actual, [name]: valorFormateado }));
  };

  const toggleNegocio = (id) => {
    setNegociosSeleccionados((actuales) => {
      if (actuales.includes(id)) {
        if (actuales.length === 1) return actuales;
        return actuales.filter((item) => item !== id);
      }
      return [...actuales, id];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formulario.nombre.trim()) {
      setError("Ingresa el nombre del empleado.");
      return;
    }
    if (!formulario.correo.trim()) {
      setError("Ingresa un correo electrónico.");
      return;
    }
    if (formulario.telefono.trim() && !telefonoCompleto(formulario.telefono)) {
      setError("El teléfono debe tener 8 dígitos y usar el formato 0000-0000.");
      return;
    }

    const ids = [...new Set((puedeAsignarVariosNegocios ? negociosSeleccionados : [negocioActivoId]).filter(Boolean))];
    if (!ids.length) {
      setError("El empleado debe estar asociado al menos a un negocio.");
      return;
    }

    setGuardando(true);

    const data = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim() ? formatearTelefono(formulario.telefono) : "",
      rol: formulario.rol,
      estado: formulario.estado,
      negocioId: ids.includes(negocioActivoId) ? negocioActivoId : ids[0],
      negocioIds: ids,
      ...(formulario.clave.trim() ? { clave: formulario.clave.trim() } : {}),
    };

    try {
      if (empleado) {
        const actualizado = await updateEmpleado(empleado.id, data);
        onActualizado(actualizado);
      } else {
        const creado = await createEmpleado(data, ids);
        onCreado(creado);
        setFormulario(formularioInicial);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="empleados-form-contenedor">
      <div className="empleados-form-header">
        <div>
          <h2>{empleado ? "Editar empleado" : "Agregar empleado"}</h2>
          <p>
            {empleado
              ? "Actualiza la información, permisos y negocios donde trabaja esta persona."
              : "Registra a una persona para asociarla al negocio actual."}
          </p>
        </div>
      </div>

      {error && <div className="empleados-form-error">{error}</div>}

      <form className="empleados-form" onSubmit={handleSubmit}>
        <div className="empleados-form-section empleados-form-section--wide">
          <div className="empleados-form-section-title">
            <span>Información personal</span>
            <small>Datos básicos del empleado</small>
          </div>
        </div>

        <div className="empleado-form-group empleado-form-group--wide">
          <label className="empleado-label empleado-label--perfil" htmlFor="empleado-nombre">Nombre completo</label>
          <input id="empleado-nombre" name="nombre" type="text" value={formulario.nombre} onChange={handleChange} placeholder="Ej. María Rodríguez" required />
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--correo" htmlFor="empleado-correo">Correo electrónico</label>
          <input id="empleado-correo" name="correo" type="email" value={formulario.correo} onChange={handleChange} placeholder="nombre@correo.com" required />
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--telefono" htmlFor="empleado-telefono">Teléfono</label>
          <input id="empleado-telefono" name="telefono" type="tel" value={formulario.telefono} onChange={handleChange} placeholder="8888-8888" maxLength={9} inputMode="numeric" autoComplete="tel" />
        </div>

        <div className="empleado-form-group empleado-form-group--wide">
          <label className="empleado-label" htmlFor="empleado-clave">{empleado ? "Nueva contraseña (opcional)" : "Contraseña"}</label>
          <input id="empleado-clave" name="clave" type="password" value={formulario.clave} onChange={handleChange} placeholder={empleado ? "Dejar vacío para conservarla" : "Contraseña de acceso"} autoComplete="new-password" required={!empleado} />
        </div>

        <div className="empleados-form-section empleados-form-section--wide empleados-form-section--laboral">
          <div className="empleados-form-section-title">
            <span>Información laboral</span>
            <small>Define el rol y estado dentro del negocio</small>
          </div>
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--rol">Rol</label>
          <FilterSelect id="empleado-rol" value={formulario.rol} options={ROLES} onChange={(value) => setFormulario((actual) => ({ ...actual, rol: value }))} portalMenu />
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--estado">Estado</label>
          <FilterSelect id="empleado-estado" value={formulario.estado} options={ESTADOS} onChange={(value) => setFormulario((actual) => ({ ...actual, estado: value }))} portalMenu />
        </div>

        {negociosParaMostrar.length > 0 && (
          <div className="empleado-business-assignment empleados-form-section--wide">
            <div className="empleados-form-section-title">
              <span>Negocios asociados</span>
              <small>{puedeAsignarVariosNegocios ? "Este administrador puede asignar al empleado a uno o varios de sus negocios." : "El empleado quedará asociado al negocio actual."}</small>
            </div>

            {puedeAsignarVariosNegocios ? (
              <div className="empleado-business-options">
                {negociosParaMostrar.map((negocio) => {
                  const checked = negociosSeleccionados.includes(negocio.id);
                  return (
                    <label className={`empleado-business-option${checked ? " selected" : ""}`} key={negocio.id}>
                      <input type="checkbox" checked={checked} onChange={() => toggleNegocio(negocio.id)} disabled={guardando || (checked && negociosSeleccionados.length === 1)} />
                      <span className="empleado-business-option-icon"><img src="/illustrations/negocio.png" alt="" aria-hidden="true" /></span>
                      <span className="empleado-business-option-copy"><strong>{negocio.nombre}</strong><small>{negocio.tipo}</small></span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="empleado-business-current">
                <img src="/illustrations/negocio.png" alt="" aria-hidden="true" />
                <div><strong>{negociosParaMostrar[0].nombre}</strong><small>{negociosParaMostrar[0].tipo}</small></div>
              </div>
            )}

            {cargandoNegocios && <small className="empleado-business-loading">Cargando negocios asociados...</small>}
          </div>
        )}

        <div className="empleados-form-actions">
          <button type="button" className="empleado-btn-cancelar" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button type="submit" className="empleado-btn-guardar" disabled={guardando || cargandoNegocios}>{guardando ? "Guardando..." : empleado ? "Guardar cambios" : "Agregar empleado"}</button>
        </div>
      </form>
    </section>
  );
}

export default EmpleadoForm;
