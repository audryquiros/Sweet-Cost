import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

const mockLogin = jest.fn();

jest.mock("../../context/authContext", () => ({
  useAuth: () => ({ autenticado: false, login: mockLogin }),
  getPendingBusinesses: () => [],
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("permite iniciar sesión con credenciales válidas", async () => {
    mockLogin.mockResolvedValue({
      requiereNegocio: false,
      usuario: { id: "1" },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "admin@sweetcost.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "admin123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(
      "admin@sweetcost.com",
      "admin123",
      true
    ));
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("muestra un error cuando las credenciales son inválidas", async () => {
    mockLogin.mockRejectedValue(new Error("Correo o contraseña incorrectos."));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "incorrecto@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Correo o contraseña incorrectos."
    );
  });
});
