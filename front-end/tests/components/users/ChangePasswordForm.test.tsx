import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ChangePasswordForm from "@/app/modules/profile/form/ChangePasswordForm";

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/app/modules/users/services/userService", () => ({
  changePassword: mocks.changePassword,
}));

vi.mock("@/utils/logger", () => ({
  logger: { error: mocks.logError },
}));

vi.mock("@/utils/apiErrorUtils", () => ({
  getApiError: (error: unknown) =>
    error instanceof Error ? { message: error.message } : null,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      title: "Change password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      currentPasswordRequired: "Current password is required",
      newPasswordRequired: "New password is required",
      confirmPasswordRequired: "Confirm password is required",
      passwordsDoNotMatch: "Passwords do not match",
      submit: "Change password",
      saving: "Saving...",
      success: "Password changed successfully",
      error: "Failed to change password",
    };

    return (key: string) => translations[key] ?? key;
  },
}));

async function completeForm(
  user: ReturnType<typeof userEvent.setup>,
  newPassword = "new-password-123",
  confirmPassword = "new-password-123",
) {
  await user.type(screen.getByLabelText("Current password"), "old-password");
  await user.type(screen.getByLabelText("New password"), newPassword);
  await user.type(screen.getByLabelText("Confirm password"), confirmPassword);
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.changePassword.mockResolvedValue(undefined);
  });

  it("should render the three password fields and submit button", () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change password" }),
    ).toBeInTheDocument();
  });

  it("should require all three password fields", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      screen.getByText("Current password is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("New password is required")).toBeInTheDocument();
    expect(
      screen.getByText("Confirm password is required"),
    ).toBeInTheDocument();
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("should prevent submission when the confirmation password does not match", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await completeForm(user, "new-password-123", "other-password-123");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("should submit only currentPassword and newPassword", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await completeForm(user);
    await user.click(screen.getByRole("button", { name: "Change password" }));

    await waitFor(() => {
      expect(mocks.changePassword).toHaveBeenCalledWith({
        currentPassword: "old-password",
        newPassword: "new-password-123",
      });
    });
    expect(mocks.changePassword).toHaveBeenCalledTimes(1);
  });

  it("should show success and clear the fields after changing the password", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await completeForm(user);
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password changed successfully",
    );
    expect(screen.getByLabelText("Current password")).toHaveValue("");
    expect(screen.getByLabelText("New password")).toHaveValue("");
    expect(screen.getByLabelText("Confirm password")).toHaveValue("");
  });

  it("should keep the fields and show the backend error when the request fails", async () => {
    const user = userEvent.setup();
    mocks.changePassword.mockRejectedValue(
      new Error("Incorrect current password"),
    );
    render(<ChangePasswordForm />);

    await completeForm(user);
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect current password",
    );
    expect(screen.getByLabelText("Current password")).toHaveValue(
      "old-password",
    );
    expect(mocks.logError).toHaveBeenCalledTimes(1);
  });
});
