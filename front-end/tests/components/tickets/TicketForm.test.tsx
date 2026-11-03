import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TicketForm from "@/app/modules/tickets/components/form/TicketForm";

import { USER_ROLES } from "@/types/roleTypes";
import { FORM_MODES } from "@/utils/constans";

import type { TicketResponse } from "@/types/ticketTypes";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),

  getAllCategories: vi.fn(),
  getAllPriorities: vi.fn(),
  getAllTechnicians: vi.fn(),

  createTicket: vi.fn(),
  updateTicket: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/app/modules/categories/services/categoryService", () => ({
  getAllCategories: mocks.getAllCategories,
}));

vi.mock("@/app/modules/priorities/services/priorityService", () => ({
  getAllPriorities: mocks.getAllPriorities,
}));

vi.mock("@/app/modules/users/services/userService", () => ({
  getAllTechnicians: mocks.getAllTechnicians,
}));

vi.mock("@/app/modules/tickets/services/ticketService", () => ({
  createTicket: mocks.createTicket,
  updateTicket: mocks.updateTicket,
}));

vi.mock("next-intl", () => {
  const translations: Record<string, string> = {
    createTitle: "Create ticket",
    editTitle: "Edit ticket",
    title: "Title",
    description: "Description",
    requestedFor: "Requested for",
    category: "Category",
    priority: "Priority",
    selectUser: "Select user",
    selectCategory: "Select category",
    selectPriority: "Select priority",
    createTicket: "Create ticket",
    saveChanges: "Save changes",
    cancel: "Cancel",
    saving: "Saving...",
    titleRequired: "Title is required",
    descriptionRequired: "Description is required",
    requestedForRequired: "Requested user is required",
    categoryRequired: "Category is required",
    priorityRequired: "Priority is required",
    categoriesLoadError: "Failed to load categories",
    prioritiesLoadError: "Failed to load priorities",
    usersLoadError: "Failed to load users",
    createError: "Failed to create ticket",
    updateError: "Failed to update ticket",
  };

  const translate = Object.assign((key: string) => translations[key] ?? key, {
    has: (_key: string) => false,
  });

  return {
    useTranslations: () => translate,
  };
});

const categories = [
  {
    idCategory: 1,
    name: "Hardware",
    active: true,
  },
];

const priorities = [
  {
    idPriority: 2,
    name: "HIGH",
    active: true,
  },
];

const technicians = [
  {
    idUser: 7,
    username: "john",
  },
];

const selectedTicket: TicketResponse = {
  idTicket: 15,
  title: "Printer issue",
  description: "Printer does not work",
  createdAt: "2026-11-03T10:00:00",
  lastUpdated: "2026-11-03T11:00:00",
  createdBy: {
    idUser: 7,
    username: "john",
  },
  requestedFor: {
    idUser: 7,
    username: "john",
  },
  assignedTo: null,
  category: categories[0],
  priority: priorities[0],
  status: {
    idStatus: 1,
    name: "OPEN",
    active: true,
  },
};

describe("TicketForm", () => {
  const onClose = vi.fn();
  const onSubmitSuccess = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mocks.useAuth.mockReturnValue({
      user: {
        userId: 7,
        username: "john",
        role: USER_ROLES.USER,
      },
    });

    mocks.getAllCategories.mockResolvedValue(categories);
    mocks.getAllPriorities.mockResolvedValue(priorities);
    mocks.getAllTechnicians.mockResolvedValue(technicians);

    mocks.createTicket.mockResolvedValue(selectedTicket);
    mocks.updateTicket.mockResolvedValue(selectedTicket);
  });

  it("should render create form and load options for USER", async () => {
    render(
      <TicketForm
        formMode={FORM_MODES.CREATE}
        selectedTicket={null}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Create ticket" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: "Title" })).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: "Description" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.getAllCategories).toHaveBeenCalledTimes(1);
      expect(mocks.getAllPriorities).toHaveBeenCalledTimes(1);
    });

    expect(mocks.getAllTechnicians).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("combobox", { name: "Requested for" }),
    ).not.toBeInTheDocument();
  });

  it("should show validation errors when required fields are empty", async () => {
    const user = userEvent.setup();

    render(
      <TicketForm
        formMode={FORM_MODES.CREATE}
        selectedTicket={null}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();

    expect(screen.getByText("Description is required")).toBeInTheDocument();

    expect(screen.getByText("Category is required")).toBeInTheDocument();

    expect(screen.getByText("Priority is required")).toBeInTheDocument();

    expect(mocks.createTicket).not.toHaveBeenCalled();
    expect(onSubmitSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should create a ticket for the authenticated USER", async () => {
    const user = userEvent.setup();

    render(
      <TicketForm
        formMode={FORM_MODES.CREATE}
        selectedTicket={null}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Title" }),
      "Printer issue",
    );

    await user.type(
      screen.getByRole("textbox", { name: "Description" }),
      "Printer does not work",
    );

    await waitFor(() => {
      expect(mocks.getAllPriorities).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox", { name: "Category" }));

    await user.click(await screen.findByRole("option", { name: "Hardware" }));

    await user.click(screen.getByRole("combobox", { name: "Priority" }));

    await user.click(await screen.findByRole("option", { name: "HIGH" }));

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    await waitFor(() => {
      expect(mocks.createTicket).toHaveBeenCalledWith({
        title: "Printer issue",
        description: "Printer does not work",
        requestedForId: 7,
        categoryId: 1,
        priorityId: 2,
      });
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should allow ADMIN to create a ticket for another user", async () => {
    const user = userEvent.setup();

    mocks.useAuth.mockReturnValue({
      user: {
        userId: 1,
        username: "admin",
        role: USER_ROLES.ADMIN,
      },
    });

    render(
      <TicketForm
        formMode={FORM_MODES.CREATE}
        selectedTicket={null}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    await waitFor(() => {
      expect(mocks.getAllTechnicians).toHaveBeenCalledTimes(1);
    });

    await user.type(
      screen.getByRole("textbox", { name: "Title" }),
      "Printer issue",
    );

    await user.type(
      screen.getByRole("textbox", { name: "Description" }),
      "Printer does not work",
    );

    await user.click(screen.getByRole("combobox", { name: "Requested for" }));

    await user.click(await screen.findByRole("option", { name: "john" }));

    await user.click(screen.getByRole("combobox", { name: "Category" }));

    await user.click(await screen.findByRole("option", { name: "Hardware" }));

    await user.click(screen.getByRole("combobox", { name: "Priority" }));

    await user.click(await screen.findByRole("option", { name: "HIGH" }));

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    await waitFor(() => {
      expect(mocks.createTicket).toHaveBeenCalledWith({
        title: "Printer issue",
        description: "Printer does not work",
        requestedForId: 7,
        categoryId: 1,
        priorityId: 2,
      });
    });

    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should update an existing ticket", async () => {
    const user = userEvent.setup();

    render(
      <TicketForm
        formMode={FORM_MODES.EDIT}
        selectedTicket={selectedTicket}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    await waitFor(() => {
      expect(mocks.getAllCategories).toHaveBeenCalledTimes(1);
    });

    expect(mocks.getAllPriorities).not.toHaveBeenCalled();
    expect(mocks.getAllTechnicians).not.toHaveBeenCalled();

    const titleInput = screen.getByRole("textbox", {
      name: "Title",
    });

    expect(titleInput).toHaveValue("Printer issue");

    await user.clear(titleInput);
    await user.type(titleInput, "Updated printer issue");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mocks.updateTicket).toHaveBeenCalledWith(15, {
        title: "Updated printer issue",
        description: "Printer does not work",
        categoryId: 1,
      });
    });

    expect(mocks.createTicket).not.toHaveBeenCalled();
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show an error when categories cannot be loaded", async () => {
    mocks.getAllCategories.mockRejectedValue(new Error("Network error"));

    render(
      <TicketForm
        formMode={FORM_MODES.CREATE}
        selectedTicket={null}
        onClose={onClose}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load categories",
    );

    expect(mocks.getAllPriorities).not.toHaveBeenCalled();
    expect(mocks.getAllTechnicians).not.toHaveBeenCalled();
  });
});
