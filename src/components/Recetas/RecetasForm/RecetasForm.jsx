import { useEffect, useState } from "react";

import {
  createReceta,
  updateReceta,
} from "../../../services/recetaServices";

import { getProductos } from "../../../services/productoServices";

import "./RecetasForm.css";

const formularioInicial = {
  nombre: "",
  descripcion: "",
  rendimiento: "",
  unidadRendimiento: "unidad",
  ingredientes: [],
};

function RecetasForm({
  receta,
  resultadoConversor,
  onRecetaCreada,
  onRecetaActualizada,
  onCancelar,
  onSeleccionarIngrediente,
}) {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargandoProductos, setCargandoProductos] =
    useState(true);

  const [ingredienteActivo, setIngredienteActivo] =
    useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (receta) {
      setFormulario({
        nombre: receta.nombre || "",
        descripcion: receta.descripcion || "",
        rendimiento: receta.rendimiento ?? "",
        unidadRendimiento:
          receta.unidadRendimiento || "unidad",
        ingredientes: receta.ingredientes || [],
      });
    } else {
      setFormulario(formularioInicial);
    }

    setIngredienteActivo(null);
    onSeleccionarIngrediente(null, "");
    setError("");
  }, [receta]);

  useEffect(() => {
    if (!resultadoConversor) {
      return;
    }

    const {
      ingredienteIndex,
      valor,
      unidad,
    } = resultadoConversor;

    if (
      ingredienteIndex === null ||
      ingredienteIndex === undefined
    ) {
      return;
    }

    setFormulario((formularioActual) => {
      const ingredientesActualizados = [
        ...formularioActual.ingredientes,
      ];

      if (
        !ingredientesActualizados[
          ingredienteIndex
        ]
      ) {
        return formularioActual;
      }

      ingredientesActualizados[
        ingredienteIndex
      ] = {
        ...ingredientesActualizados[
          ingredienteIndex
        ],
        cantidad: valor,
        unidad,
      };

      return {
        ...formularioActual,
        ingredientes: ingredientesActualizados,
      };
    });

    setError("");
  }, [resultadoConversor]);

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);

      const data = await getProductos();

      setProductos(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setCargandoProductos(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  };

  const agregarIngrediente = () => {
    const nuevoIngrediente = {
      productoId: "",
      cantidad: "",
      unidad: "",
    };

    const nuevoIndice =
      formulario.ingredientes.length;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      ingredientes: [
        ...formularioActual.ingredientes,
        nuevoIngrediente,
      ],
    }));

    setIngredienteActivo(nuevoIndice);

    onSeleccionarIngrediente(
      nuevoIndice,
      ""
    );
  };

  const actualizarIngrediente = (
    indice,
    campo,
    valor
  ) => {
    setFormulario((formularioActual) => {
      const ingredientesActualizados = [
        ...formularioActual.ingredientes,
      ];

      ingredientesActualizados[indice] = {
        ...ingredientesActualizados[indice],
        [campo]: valor,
      };

      return {
        ...formularioActual,
        ingredientes: ingredientesActualizados,
      };
    });
  };

  const seleccionarProducto = (
    indice,
    productoId
  ) => {
    const producto = productos.find(
      (producto) =>
        String(producto.id) ===
        String(productoId)
    );

    const unidad = producto
      ? obtenerUnidadBase(producto.unidad)
      : "";

    setFormulario((formularioActual) => {
      const ingredientesActualizados = [
        ...formularioActual.ingredientes,
      ];

      ingredientesActualizados[indice] = {
        ...ingredientesActualizados[indice],
        productoId,
        unidad,
      };

      return {
        ...formularioActual,
        ingredientes: ingredientesActualizados,
      };
    });

    setIngredienteActivo(indice);

    onSeleccionarIngrediente(
      indice,
      productoId
    );
  };

  const seleccionarIngrediente = (
    indice
  ) => {
    const ingrediente =
      formulario.ingredientes[indice];

    setIngredienteActivo(indice);

    onSeleccionarIngrediente(
      indice,
      ingrediente?.productoId || ""
    );
  };

  const eliminarIngrediente = (
    indice
  ) => {
    setFormulario((formularioActual) => ({
      ...formularioActual,
      ingredientes:
        formularioActual.ingredientes.filter(
          (_, index) => index !== indice
        ),
    }));

    setIngredienteActivo(null);

    onSeleccionarIngrediente(null, "");
  };

  const obtenerUnidadBase = (unidad) => {
    if (unidad === "kg") {
      return "g";
    }

    if (unidad === "l") {
      return "ml";
    }

    return unidad;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setGuardando(true);

    if (!formulario.nombre.trim()) {
      setError(
        "Ingresa un nombre para la receta."
      );
      setGuardando(false);
      return;
    }

    if (
      Number(formulario.rendimiento) <= 0
    ) {
      setError(
        "El rendimiento debe ser mayor que cero."
      );
      setGuardando(false);
      return;
    }

    const ingredientesValidos =
      formulario.ingredientes.filter(
        (ingrediente) =>
          ingrediente.productoId &&
          Number(ingrediente.cantidad) > 0
      );

    if (
      ingredientesValidos.length === 0
    ) {
      setError(
        "Agrega al menos un ingrediente válido."
      );
      setGuardando(false);
      return;
    }

    const recetaData = {
      nombre: formulario.nombre.trim(),
      descripcion:
        formulario.descripcion.trim(),
      rendimiento: Number(
        formulario.rendimiento
      ),
      unidadRendimiento:
        formulario.unidadRendimiento,
      ingredientes:
        ingredientesValidos.map(
          (ingrediente) => ({
            productoId:
              ingrediente.productoId,
            cantidad: Number(
              ingrediente.cantidad
            ),
            unidad: ingrediente.unidad,
          })
        ),
    };

    try {
      if (receta) {
        const recetaActualizada =
          await updateReceta(
            receta.id,
            recetaData
          );

        onRecetaActualizada(
          recetaActualizada
        );
      } else {
        const recetaCreada =
          await createReceta(
            recetaData
          );

        onRecetaCreada(
          recetaCreada
        );

        setFormulario(
          formularioInicial
        );

        setIngredienteActivo(null);
        onSeleccionarIngrediente(
          null,
          ""
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="recetas-form">
      <div className="recetas-form-header">
        <div>
          <h2>
            {receta
              ? "Editar receta"
              : "Agregar receta"}
          </h2>

          <p>
            {receta
              ? "Modifica la información y los ingredientes de la receta."
              : "Crea una receta utilizando los productos registrados."}
          </p>
        </div>
      </div>

      {error && (
        <div className="recetas-form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="receta-form-group">
          <label htmlFor="nombre">
            Nombre de la receta
          </label>

          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Ej. Mini Donas"
            required
          />
        </div>

        <div className="receta-form-group">
          <label htmlFor="descripcion">
            Descripción
          </label>

          <input
            id="descripcion"
            type="text"
            name="descripcion"
            value={formulario.descripcion}
            onChange={handleChange}
            placeholder="Ej. Receta base de mini donas"
          />
        </div>

        <div className="receta-form-group">
          <label htmlFor="rendimiento">
            Rendimiento
          </label>

          <input
            id="rendimiento"
            type="number"
            name="rendimiento"
            value={formulario.rendimiento}
            onChange={handleChange}
            placeholder="Ej. 20"
            min="0"
            step="any"
            required
          />
        </div>

        <div className="receta-form-group">
          <label htmlFor="unidadRendimiento">
            Unidad del rendimiento
          </label>

          <select
            id="unidadRendimiento"
            name="unidadRendimiento"
            value={
              formulario.unidadRendimiento
            }
            onChange={handleChange}
          >
            <option value="unidad">
              Unidades
            </option>

            <option value="docena">
              Docenas
            </option>

            <option value="porciones">
              Porciones
            </option>
          </select>
        </div>

        <div className="receta-ingredientes">
          <div className="receta-ingredientes-header">
            <div>
              <h3>Ingredientes</h3>

              <p>
                Selecciona un ingrediente para
                utilizar el conversor.
              </p>
            </div>

            <button
              type="button"
              className="btn-agregar-ingrediente"
              onClick={agregarIngrediente}
              disabled={cargandoProductos}
            >
              Agregar ingrediente
            </button>
          </div>

          {formulario.ingredientes
            .length === 0 && (
            <div className="ingredientes-vacio">
              <p>
                Todavía no has agregado
                ingredientes.
              </p>

              <span>
                Agrega los productos utilizados
                en esta receta.
              </span>
            </div>
          )}

          <div className="ingredientes-lista">
            {formulario.ingredientes.map(
              (
                ingrediente,
                indice
              ) => {
                const productoSeleccionado =
                  productos.find(
                    (producto) =>
                      String(
                        producto.id
                      ) ===
                      String(
                        ingrediente.productoId
                      )
                  );

                const unidad =
                  ingrediente.unidad ||
                  (productoSeleccionado
                    ? obtenerUnidadBase(
                        productoSeleccionado.unidad
                      )
                    : "");

                const activo =
                  ingredienteActivo ===
                  indice;

                return (
                  <div
                    className={`ingrediente-item ${
                      activo
                        ? "ingrediente-activo"
                        : ""
                    }`}
                    key={indice}
                    onClick={() =>
                      seleccionarIngrediente(
                        indice
                      )
                    }
                  >
                    <div className="ingrediente-campo producto">
                      <label>
                        Producto
                      </label>

                      <select
                        value={
                          ingrediente.productoId
                        }
                        onChange={(e) =>
                          seleccionarProducto(
                            indice,
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Seleccionar producto
                        </option>

                        {productos.map(
                          (producto) => (
                            <option
                              key={
                                producto.id
                              }
                              value={
                                producto.id
                              }
                            >
                              {
                                producto.nombre
                              }

                              {producto.marca
                                ? ` - ${producto.marca}`
                                : ""}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="ingrediente-campo cantidad">
                      <label>
                        Cantidad
                      </label>

                      <input
                        type="number"
                        value={
                          ingrediente.cantidad
                        }
                        onChange={(e) =>
                          actualizarIngrediente(
                            indice,
                            "cantidad",
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          seleccionarIngrediente(
                            indice
                          )
                        }
                        placeholder="Ej. 300"
                        min="0"
                        step="any"
                        required
                      />
                    </div>

                    <div className="ingrediente-campo unidad">
                      <label>
                        Unidad
                      </label>

                      <input
                        type="text"
                        value={unidad}
                        readOnly
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-eliminar-ingrediente"
                      onClick={(e) => {
                        e.stopPropagation();

                        eliminarIngrediente(
                          indice
                        );
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="recetas-form-actions">
          <button
            type="button"
            className="receta-btn-cancelar"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="receta-btn-guardar"
            disabled={
              guardando ||
              cargandoProductos
            }
          >
            {guardando
              ? "Guardando..."
              : receta
              ? "Guardar cambios"
              : "Agregar receta"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default RecetasForm;