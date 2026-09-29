import { useEffect, useState } from "react";
import FilterSelect from "../../common/FilterSelect";
import { createEmpleado, updateEmpleado } from "../../../services/empleadoServices";
import "./EmpleadoForm.css";
import { formatearTelefono, telefonoCompleto } from "../../../utils/formatearTelefono";

const formularioInicial = {
  nombre: "",
  correo: "",
  telefono: "",
  rol: "empleado",
  estado: "activo",
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
  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (empleado) {
      setFormulario({
        nombre: empleado.nombre || "",
        correo: empleado.correo || "",
        telefono: formatearTelefono(empleado.telefono || ""),
        rol: empleado.rol || "empleado",
        estado: empleado.estado || "activo",
      });
    } else {
      setFormulario(formularioInicial);
    }
    setError("");
  }, [empleado]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const valorFormateado = name === "telefono" ? formatearTelefono(value) : value;
    setFormulario((actual) => ({ ...actual, [name]: valorFormateado }));
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

    setGuardando(true);

    const data = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim() ? formatearTelefono(formulario.telefono) : "",
      rol: formulario.rol,
      estado: formulario.estado,
    };

    try {
      if (empleado) {
        const actualizado = await updateEmpleado(empleado.id, data);
        onActualizado(actualizado);
      } else {
        const creado = await createEmpleado(data);
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
              ? "Actualiza la información y permisos básicos del empleado."
              : "Registra a una persona para asociarla al negocio."}
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
          <label className="empleado-label empleado-label--perfil" htmlFor="empleado-nombre">
            Nombre completo
          </label>
          <input
            id="empleado-nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Ej. María Rodríguez"
            required
          />
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--correo" htmlFor="empleado-correo">
            Correo electrónico
          </label>
          <input
            id="empleado-correo"
            name="correo"
            type="email"
            value={formulario.correo}
            onChange={handleChange}
            placeholder="nombre@correo.com"
            required
          />
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--telefono" htmlFor="empleado-telefono">
            Teléfono
          </label>
          <input
            id="empleado-telefono"
            name="telefono"
            type="tel"
            value={formulario.telefono}
            onChange={handleChange}
            placeholder="8888-8888"
            maxLength={9}
            inputMode="numeric"
            autoComplete="tel"
          />
        </div>

        <div className="empleados-form-section empleados-form-section--wide empleados-form-section--laboral">
          <div className="empleados-form-section-title">
            <span>Información laboral</span>
            <small>Define el rol y estado dentro del negocio</small>
          </div>
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--rol">Rol</label>
          <FilterSelect
            id="empleado-rol"
            value={formulario.rol}
            options={ROLES}
            onChange={(value) => setFormulario((actual) => ({ ...actual, rol: value }))}
            portalMenu
          />
        </div>

        <div className="empleado-form-group">
          <label className="empleado-label empleado-label--estado">Estado</label>
          <FilterSelect
            id="empleado-estado"
            value={formulario.estado}
            options={ESTADOS}
            onChange={(value) => setFormulario((actual) => ({ ...actual, estado: value }))}
            portalMenu
          />
        </div>

        <div className="empleados-form-actions">
          <button type="button" className="empleado-btn-cancelar" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="empleado-btn-guardar" disabled={guardando}>
            {guardando ? "Guardando..." : empleado ? "Guardar cambios" : "Agregar empleado"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EmpleadoForm;
