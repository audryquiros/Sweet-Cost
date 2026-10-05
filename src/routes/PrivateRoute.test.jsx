import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

jest.mock("../context/authContext", () => ({
  useAuth: jest.fn(),
  getPendingBusinesses: jest.fn(() => []),
}));

import { useAuth } from "../context/authContext";

describe("PrivateRoute", () => {
  it("redirige a 403 cuando un empleado intenta acceder a una ruta exclusiva del administrador", () => {
    useAuth.mockReturnValue({
      autenticado: true,
      usuario: {
        id: "emp-1",
        rol: "empleado",
        negocioId: "negocio-1",
      },
    });

    render(
      <MemoryRouter initialEntries={["/empleados"]}>
        <Routes>
          <Route
            path="/empleados"
            element={
              <PrivateRoute allowedRoles={["administrador"]}>
                <div>Área de empleados</div>
              </PrivateRoute>
            }
          />
          <Route path="/403" element={<div>Acceso denegado</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Área de empleados")).not.toBeInTheDocument();
  });
});
