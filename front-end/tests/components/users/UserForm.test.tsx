import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UserForm from "@/app/modules/users/components/form/UserForm";
import { FORM_MODES } from "@/utils/constans";
import type { UserResponse } from "@/types/userTypes";

const mocks = vi.hoisted(() => ({
  getAllRoles: vi.fn(),
  getAllActiveDepartments: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/app/modules/roles/services/rolesService", () => ({
  getAllRoles: mocks.getAllRoles,
}));
vi.mock("@/app/modules/departments/services/departmentService", () => ({
  getAllActiveDepartments: mocks.getAllActiveDepartments,
}));
vi.mock("@/app/modules/users/services/userService", () => ({
  createUser: mocks.createUser,
  updateUser: mocks.updateUser,
}));
vi.mock("@/utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("next-intl", () => {
  const labels: Record<string, string> = {
    createTitle: "Create user",
    editTitle: "Edit user",
    viewTitle: "View user",
    username: "Username",
    email: "Email",
    firstName: "First name",
    lastName: "Last name",
    password: "Password",
    role: "Role",
    department: "Department",
    enabled: "Enabled",
    disabled: "Disabled",
    accountInformation: "Account information",
    selectRole: "Select role",
    selectDepartment: "Select department",
    noRolesAvailable: "No roles",
    noDepartmentsAvailable: "No departments",
    createUser: "Create user",
    saveChanges: "Save changes",
    cancel: "Cancel",
    back: "Back",
    saving: "Saving...",
    rolesLoadError: "Failed to load roles",
    usernameRequired: "Username required",
    emailRequired: "Email required",
    firstNameRequired: "First name required",
    lastNameRequired: "Last name required",
    passwordRequired: "Password required",
    roleRequired: "Role required",
    departmentRequired: "Department required",
  };
  const translate = (key: string) => labels[key] ?? key;
  const translateRole = Object.assign((key: string) => key, { has: () => true });
  return {
    useTranslations: (namespace: string) =>
      namespace === "Common.Roles" ? translateRole : translate,
  };
});

const roles = [
  { idRole: 1, name: "ADMIN" },
  { idRole: 2, name: "USER" },
];
const departments = [{ idDepartment: 3, name: "IT", active: true }];
const selectedUser: UserResponse = {
  idUser: 15,
  username: "john",
  email: "john@example.com",
  firstName: "John",
  lastName: "Smith",
  enabled: true,
  role: roles[0],
  department: departments[0],
};

describe("UserForm", () => {
  const onClose = vi.fn();
  const onSubmitSuccess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getAllRoles.mockResolvedValue(roles);
    mocks.getAllActiveDepartments.mockResolvedValue(departments);
    mocks.createUser.mockResolvedValue(selectedUser);
    mocks.updateUser.mockResolvedValue(selectedUser);
  });

  const renderForm = (
    mode: (typeof FORM_MODES)[keyof typeof FORM_MODES],
    user: UserResponse | null = null,
  ) =>
    render(
      <UserForm
        formMode={mode}
        selectedUser={user}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

  it("renders create mode and loads role and department options", async () => {
    renderForm(FORM_MODES.CREATE);

    expect(
      screen.getByRole("heading", { name: "Create user" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.getAllRoles).toHaveBeenCalledTimes(1);
      expect(mocks.getAllActiveDepartments).toHaveBeenCalledTimes(1);
    });
  });

  it("shows required-field errors and does not submit an empty form", async () => {
    const user = userEvent.setup();
    renderForm(FORM_MODES.CREATE);

    await user.click(screen.getByRole("button", { name: "Create user" }));

    expect(screen.getByText("Username required")).toBeInTheDocument();
    expect(screen.getByText("Password required")).toBeInTheDocument();
    expect(screen.getByText("Role required")).toBeInTheDocument();
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it("creates a user with the data entered", async () => {
    const user = userEvent.setup();
    renderForm(FORM_MODES.CREATE);

    await waitFor(() =>
      expect(mocks.getAllActiveDepartments).toHaveBeenCalledTimes(1),
    );
    await user.type(screen.getByRole("textbox", { name: "Username" }), "alice");
    await user.type(
      screen.getByRole("textbox", { name: "Email" }),
      "alice@example.com",
    );
    await user.type(
      screen.getByRole("textbox", { name: "First name" }),
      "Alice",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Last name" }),
      "Brown",
    );
    await user.type(screen.getByLabelText("Password"), "secret123");

    await user.click(screen.getByRole("combobox", { name: "Role" }));
    await user.click(await screen.findByRole("option", { name: "ADMIN" }));
    await user.click(screen.getByRole("combobox", { name: "Department" }));
    await user.click(await screen.findByRole("option", { name: "IT" }));
    await user.click(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() => {
      expect(mocks.createUser).toHaveBeenCalledWith({
        username: "alice",
        email: "alice@example.com",
        firstName: "Alice",
        lastName: "Brown",
        password: "secret123",
        roleId: 1,
        departmentId: 3,
        enabled: true,
      });
    });
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("edits a user without sending a password", async () => {
    const user = userEvent.setup();
    renderForm(FORM_MODES.EDIT, selectedUser);

    await waitFor(() =>
      expect(mocks.getAllActiveDepartments).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    const firstName = screen.getByRole("textbox", { name: "First name" });
    expect(firstName).toHaveValue("John");
    await user.clear(firstName);
    await user.type(firstName, "Jane");
    await user.click(screen.getByRole("checkbox", { name: "Enabled" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith(15, {
        username: "john",
        email: "john@example.com",
        firstName: "Jane",
        lastName: "Smith",
        roleId: 1,
        departmentId: 3,
        enabled: false,
      });
    });
    expect(mocks.createUser).not.toHaveBeenCalled();
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
  });

  it("validates the edit fields and cancels without an update", async () => {
    const user = userEvent.setup();
    renderForm(FORM_MODES.EDIT, selectedUser);

    await user.clear(screen.getByRole("textbox", { name: "First name" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("First name required")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmitSuccess).not.toHaveBeenCalled();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("shows each user detail once and returns with Back", async () => {
    const user = userEvent.setup();
    renderForm(FORM_MODES.VIEW, { ...selectedUser, enabled: false });

    expect(screen.getByRole("heading", { name: /View user John Smith/ })).toBeInTheDocument();
    expect(screen.getByText("john")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(screen.queryByText("John")).not.toBeInTheDocument();
    expect(screen.queryByText("Smith")).not.toBeInTheDocument();
    const account = within(screen.getByRole("region", { name: "Account information" }));
    expect(account.getByText("john@example.com")).toBeInTheDocument();
    expect(account.getByText("IT")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(mocks.getAllRoles).not.toHaveBeenCalled();
    expect(mocks.getAllActiveDepartments).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("stops loading options if roles cannot be retrieved", async () => {
    mocks.getAllRoles.mockRejectedValue(new Error("Network error"));
    renderForm(FORM_MODES.CREATE);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load roles",
    );
    expect(mocks.getAllActiveDepartments).not.toHaveBeenCalled();
  });
});
