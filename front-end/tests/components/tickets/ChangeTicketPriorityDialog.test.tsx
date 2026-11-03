import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ChangeTicketPriorityDialog from "@/app/modules/tickets/components/actions/ChangeTicketPriorityDialog";

import { USER_ROLES } from "@/types/roleTypes";
import type { PriorityResponse } from "@/types/priorityTypes";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getAllActivePriorities: vi.fn(),
  changeTicketPriority: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/app/modules/priorities/services/priorityService", () => ({
  getAllActivePriorities: mocks.getAllActivePriorities,
}));

vi.mock("@/app/modules/tickets/services/ticketService", () => ({
  changeTicketPriority: mocks.changeTicketPriority,
}));

vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock("next-intl", () => {
  const translations: Record<string, string> = {
    title: "Change ticket priority",
    currentPriority: "Current priority",
    selectNewPriority: "Select new priority",
    priority: "Priority",
    cancel: "Cancel",
    updatePriority: "Update priority",
    updating: "Updating...",
    loadError: "Failed to load priorities",
    updateError: "Failed to update priority",
  };

  const translate = Object.assign(
    (key: string, values?: Record<string, unknown>) => {
      if (key === "subtitle") {
        return `Ticket #${values?.ticketId}`;
      }

      return translations[key] ?? key;
    },
    {
      has: (_key: string) => false,
    },
  );

  return {
    useTranslations: () => translate,
  };
});

const priorities: PriorityResponse[] = [
  {
    idPriority: 1,
    name: "LOW",
    active: true,
  },
  {
    idPriority: 2,
    name: "MEDIUM",
    active: true,
  },
  {
    idPriority: 3,
    name: "HIGH",
    active: true,
  },
];

describe("ChangeTicketPriorityDialog", () => {
  const onClose = vi.fn();
  const onTicketUpdated = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    mocks.useAuth.mockReturnValue({
      user: {
        userId: 5,
        username: "technician",
        role: USER_ROLES.TECHNICIAN,
      },
    });

    mocks.getAllActivePriorities.mockResolvedValue(priorities);

    mocks.changeTicketPriority.mockResolvedValue(undefined);
  });

  const renderDialog = () =>
    render(
      <ChangeTicketPriorityDialog
        open={true}
        ticketId={42}
        currentPriority={priorities[1]}
        onClose={onClose}
        onTicketUpdated={onTicketUpdated}
      />,
    );

  it("should render the dialog and load active priorities", async () => {
    renderDialog();

    expect(
      screen.getByRole("heading", {
        name: "Change ticket priority",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("MEDIUM")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.getAllActivePriorities).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole("button", {
        name: "Update priority",
      }),
    ).toBeDisabled();
  });

  it("should change the ticket priority successfully", async () => {
    const user = userEvent.setup();

    renderDialog();

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "HIGH",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Update priority",
      }),
    );

    await waitFor(() => {
      expect(mocks.changeTicketPriority).toHaveBeenCalledWith(42, {
        priorityId: 3,
      });
    });

    expect(onTicketUpdated).toHaveBeenCalledTimes(1);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should prevent updating to the current priority", async () => {
    const user = userEvent.setup();

    renderDialog();

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "MEDIUM",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Update priority",
      }),
    ).toBeDisabled();

    expect(mocks.changeTicketPriority).not.toHaveBeenCalled();
  });

  it("should not load priorities for USER role", () => {
    mocks.useAuth.mockReturnValue({
      user: {
        userId: 7,
        username: "john",
        role: USER_ROLES.USER,
      },
    });

    renderDialog();

    expect(mocks.getAllActivePriorities).not.toHaveBeenCalled();

    expect(mocks.changeTicketPriority).not.toHaveBeenCalled();
  });

  it("should show an error when priorities cannot be loaded", async () => {
    mocks.getAllActivePriorities.mockRejectedValue(new Error("Network error"));

    renderDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load priorities",
    );

    expect(mocks.changeTicketPriority).not.toHaveBeenCalled();
  });

  it("should show an error when updating priority fails", async () => {
    const user = userEvent.setup();

    mocks.changeTicketPriority.mockRejectedValue(new Error("Network error"));

    renderDialog();

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "HIGH",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Update priority",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to update priority",
    );

    expect(mocks.changeTicketPriority).toHaveBeenCalledWith(42, {
      priorityId: 3,
    });

    expect(onTicketUpdated).not.toHaveBeenCalled();

    expect(onClose).not.toHaveBeenCalled();
  });
});
