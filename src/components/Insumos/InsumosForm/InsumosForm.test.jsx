import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InsumosForm from "./InsumosForm";
import { createInsumo } from "../../../services/insumoServices";

jest.mock("../../../services/insumoServices", () => ({
  createInsumo: jest.fn(),
  updateInsumo: jest.fn(),
}));

describe("InsumosForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("registra un insumo con los datos ingresados", async () => {
    const insumoCreado = { id: "i1", nombre: "Caja", cantidad: 10 };
    createInsumo.mockResolvedValue(insumoCreado);
    const onInsumoCreado = jest.fn();

    render(
      <InsumosForm
        insumo={null}
        onInsumoCreado={onInsumoCreado}
        onInsumoActualizado={jest.fn()}
        onCancelar={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Nombre del insumo"), {
      target: { value: "Caja" },
    });
    fireEvent.change(screen.getByLabelText("Presentación"), {
      target: { value: "Caja para 10 unidades" },
    });
    fireEvent.change(screen.getByLabelText("Cantidad comprada"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("Precio total de compra"), {
      target: { value: "2500" },
    });

    fireEvent.click(screen.getByRole("button", { name: /agregar insumo/i }));

    await waitFor(() => expect(createInsumo).toHaveBeenCalledWith({
      nombre: "Caja",
      presentacion: "Caja para 10 unidades",
      cantidad: 10,
      unidad: "unidad",
      precio: 2500,
    }));
    expect(onInsumoCreado).toHaveBeenCalledWith(insumoCreado);
  });
});
