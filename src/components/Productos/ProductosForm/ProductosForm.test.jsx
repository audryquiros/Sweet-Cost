import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductosForm from "./ProductosForm";
import { createProducto } from "../../../services/productoServices";

jest.mock("../../../services/productoServices", () => ({
  createProducto: jest.fn(),
  updateProducto: jest.fn(),
}));

describe("ProductosForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("registra un producto con los datos ingresados", async () => {
    const productoCreado = { id: "p1", nombre: "Harina", cantidadPresentaciones: 2 };
    createProducto.mockResolvedValue(productoCreado);
    const onProductoCreado = jest.fn();

    render(
      <ProductosForm
        producto={null}
        onProductoCreado={onProductoCreado}
        onProductoActualizado={jest.fn()}
        onCancelar={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Nombre del producto"), {
      target: { value: "Harina" },
    });
    fireEvent.change(screen.getByLabelText("Marca"), {
      target: { value: "Doña María" },
    });
    fireEvent.change(screen.getByLabelText("Cantidad de presentaciones"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Contenido por presentación"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText("Precio por presentación"), {
      target: { value: "1500" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /registrar producto/i })
    );

    await waitFor(() => expect(createProducto).toHaveBeenCalled());
    expect(onProductoCreado).toHaveBeenCalledWith(productoCreado);
  });
});
