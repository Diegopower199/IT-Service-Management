import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginForm from "@/app/modules/auth/components/LoginForm";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  setAuthentication: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/app/modules/auth/services/authService", () => ({
  login: mocks.login,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    setAuthentication: mocks.setAuthentication,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      title: "Sign in",
      subtitle: "Welcome",
      username: "Username",
      password: "Password",
      login: "Login",
      loggingIn: "Logging in...",
      usernameRequired: "Username is required",
      passwordRequired: "Password is required",
      invalidCredentials: "Invalid credentials",
      serverError: "Server error",
    };

    return (key: string) => translations[key] ?? key;
  },
}));

vi.mock("@/components/ui/LanguageSelector", () => ({
  default: () => null,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.login.mockReset();
  });

  it("should render the login form", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: "Username" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("should show validation errors when fields are empty", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Username is required")).toBeInTheDocument();

    expect(screen.getByText("Password is required")).toBeInTheDocument();

    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("should authenticate and redirect after successful login", async () => {
    const user = userEvent.setup();

    mocks.login.mockResolvedValue({
      token: "access-token",
      userId: 1,
      username: "john",
      role: "USER",
    });

    render(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: "Username" }), "john");

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith({
        username: "john",
        password: "password123",
      });
    });

    expect(mocks.setAuthentication).toHaveBeenCalledWith(
      "access-token",
      1,
      "john",
      "USER",
    );

    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("should show an error when credentials are invalid", async () => {
    const user = userEvent.setup();

    mocks.login.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          status: 403,
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
          timestamp: "2026-11-03T12:00:00",
        },
      },
    });

    render(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: "Username" }), "john");

    await user.type(screen.getByLabelText("Password"), "wrong-password");

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();

    expect(mocks.setAuthentication).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
