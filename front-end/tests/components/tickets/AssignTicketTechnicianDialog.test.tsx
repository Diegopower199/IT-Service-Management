import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AssignTicketTechnicianDialog from "@/app/modules/tickets/components/actions/AssignTicketTechnicianDialog";

import { USER_ROLES } from "@/types/roleTypes";

import type { UserSummaryResponse } from "@/types/userTypes";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getAllTechnicians: vi.fn(),
  assignTicketTechnician: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/app/modules/users/services/userService", () => ({
  getAllTechnicians: mocks.getAllTechnicians,
}));

vi.mock("@/app/modules/tickets/services/ticketService", () => ({
  assignTicketTechnician: mocks.assignTicketTechnician,
}));

vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock("next-intl", () => {
  const translations: Record<string, string> = {
    title: "Assign technician",
    currentTechnician: "Current technician",
    noTechnicianAssigned: "No technician assigned",
    selectTechnician: "Select technician",
    technician: "Technician",
    cancel: "Cancel",
    assignTechnician: "Assign technician",
    reassignTechnician: "Reassign technician",
    assigning: "Assigning...",
    loadError: "Failed to load technicians",
    assignError: "Failed to assign technician",
  };

  const translate = (key: string, values?: Record<string, unknown>) => {
    if (key === "subtitle") {
      return `Ticket #${values?.ticketId}`;
    }

    return translations[key] ?? key;
  };

  return {
    useTranslations: () => translate,
  };
});

const technicians: UserSummaryResponse[] = [
  {
    idUser: 7,
    username: "john",
  },
  {
    idUser: 9,
    username: "ana",
  },
];

describe("AssignTicketTechnicianDialog", () => {
  const onClose = vi.fn();
  const onTicketUpdated = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mocks.useAuth.mockReturnValue({
      user: {
        userId: 1,
        username: "admin",
        role: USER_ROLES.ADMIN,
      },
    });

    mocks.getAllTechnicians.mockResolvedValue(technicians);
    mocks.assignTicketTechnician.mockResolvedValue(undefined);
  });

  const renderDialog = (currentTechnician: UserSummaryResponse | null = null) =>
    render(
      <AssignTicketTechnicianDialog
        open={true}
        ticketId={42}
        currentTechnician={currentTechnician}
        onClose={onClose}
        onTicketUpdated={onTicketUpdated}
      />,
    );

  it("should render the dialog and load technicians", async () => {
    renderDialog();

    expect(
      screen.getByRole("heading", {
        name: "Assign technician",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("No technician assigned")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.getAllTechnicians).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole("button", {
        name: "Assign technician",
      }),
    ).toBeDisabled();
  });

  it("should assign a technician successfully", async () => {
    const user = userEvent.setup();

    renderDialog();

    await waitFor(() => {
      expect(mocks.getAllTechnicians).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "ana",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Assign technician",
      }),
    );

    await waitFor(() => {
      expect(mocks.assignTicketTechnician).toHaveBeenCalledWith(42, {
        assignedToId: 9,
      });
    });

    expect(onTicketUpdated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should allow reassigning a ticket to another technician", async () => {
    const user = userEvent.setup();

    renderDialog(technicians[0]);

    await waitFor(() => {
      expect(mocks.getAllTechnicians).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole("button", {
        name: "Reassign technician",
      }),
    ).toBeDisabled();

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "ana",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Reassign technician",
      }),
    );

    await waitFor(() => {
      expect(mocks.assignTicketTechnician).toHaveBeenCalledWith(42, {
        assignedToId: 9,
      });
    });

    expect(onTicketUpdated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not load technicians for USER role", () => {
    mocks.useAuth.mockReturnValue({
      user: {
        userId: 5,
        username: "normaluser",
        role: USER_ROLES.USER,
      },
    });

    renderDialog();

    expect(mocks.getAllTechnicians).not.toHaveBeenCalled();

    expect(mocks.assignTicketTechnician).not.toHaveBeenCalled();
  });

  it("should show an error when technicians cannot be loaded", async () => {
    mocks.getAllTechnicians.mockRejectedValue(new Error("Network error"));

    renderDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load technicians",
    );

    expect(mocks.assignTicketTechnician).not.toHaveBeenCalled();
  });

  it("should show an error when assigning a technician fails", async () => {
    const user = userEvent.setup();

    mocks.assignTicketTechnician.mockRejectedValue(new Error("Network error"));

    renderDialog();

    await waitFor(() => {
      expect(mocks.getAllTechnicians).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "ana",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Assign technician",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to assign technician",
    );

    expect(mocks.assignTicketTechnician).toHaveBeenCalledWith(42, {
      assignedToId: 9,
    });

    expect(onTicketUpdated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
