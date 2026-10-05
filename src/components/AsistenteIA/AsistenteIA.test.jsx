import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../../services/aiServices", () => ({
  consultarFacturasIA: jest.fn(),
}));

jest.mock("../../services/facturaServices", () => ({
  createFactura: jest.fn(),
  deleteFactura: jest.fn(),
}));

jest.mock("../../services/productoServices", () => ({
  createProducto: jest.fn(),
  deleteProducto: jest.fn(),
}));

jest.mock("../../services/insumoServices", () => ({
  createInsumo: jest.fn(),
  deleteInsumo: jest.fn(),
}));

import { FacturaRevision } from "./AsistenteIA";

describe("FacturaRevision", () => {
  it("permite editar una línea y clasificarla como producto", () => {
    const onConfirm = jest.fn();

    render(
      <FacturaRevision
        facturaInicial={{
          proveedor: "Plastimed",
          numeroFactura: "001",
          fecha: "08/09/2026",
          moneda: "CRC",
          total: 3400,
          productos: [
            {
              descripcion: "Vaso Sunday",
              cantidad: 15,
              precioUnitario: 35,
              total: 525,
            },
          ],
        }}
        onConfirm={onConfirm}
        confirmando={false}
      />
    );

    const descripcion = screen.getByDisplayValue("Vaso Sunday");

    fireEvent.change(descripcion, {
      target: {
        value: "Vaso Sunday 9oz",
      },
    });

    const tipo = screen.getByLabelText("Tipo");

    fireEvent.change(tipo, {
      target: {
        value: "producto",
      },
    });

    expect(
      screen.getByDisplayValue("Vaso Sunday 9oz")
    ).toBeInTheDocument();

    expect(tipo).toHaveValue("producto");

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar y agregar al inventario/i,
      })
    );

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        productos: [
          expect.objectContaining({
            descripcion: "Vaso Sunday 9oz",
            tipoRegistro: "producto",
          }),
        ],
      })
    );
  });
});