import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ChangeTicketStatusDialog from "@/app/modules/tickets/components/actions/ChangeTicketStatusDialog";

import { USER_ROLES } from "@/types/roleTypes";

import type { StatusResponse } from "@/types/statusTypes";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  getAllActiveStatuses: vi.fn(),
  changeTicketStatus: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/app/modules/statuses/services/statusService", () => ({
  getAllActiveStatuses: mocks.getAllActiveStatuses,
}));

vi.mock("@/app/modules/tickets/services/ticketService", () => ({
  changeTicketStatus: mocks.changeTicketStatus,
}));

vi.mock("next-intl", () => {
  const translations: Record<string, string> = {
    title: "Change ticket status",
    subtitle: "Ticket details",
    currentStatus: "Current status",
    selectNewStatus: "Select new status",
    status: "Status",
    cancel: "Cancel",
    updateStatus: "Update status",
    updating: "Updating...",
    loadError: "Failed to load statuses",
    updateError: "Failed to update status",
  };

  const translate = Object.assign((key: string) => translations[key] ?? key, {
    has: (_key: string) => false,
  });

  return {
    useTranslations: () => translate,
  };
});

const statuses: StatusResponse[] = [
  {
    idStatus: 1,
    name: "OPEN",
    active: true,
  },
  {
    idStatus: 2,
    name: "IN_PROGRESS",
    active: true,
  },
  {
    idStatus: 3,
    name: "RESOLVED",
    active: true,
  },
];

describe("ChangeTicketStatusDialog", () => {
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

    mocks.getAllActiveStatuses.mockResolvedValue(statuses);
    mocks.changeTicketStatus.mockResolvedValue(undefined);
  });

  const renderDialog = () =>
    render(
      <ChangeTicketStatusDialog
        open={true}
        ticketId={42}
        currentStatus={statuses[0]}
        onClose={onClose}
        onTicketUpdated={onTicketUpdated}
      />,
    );

  it("should render the dialog and load active statuses", async () => {
    renderDialog();

    expect(
      screen.getByRole("heading", {
        name: "Change ticket status",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("OPEN")).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.getAllActiveStatuses).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole("button", {
        name: "Update status",
      }),
    ).toBeDisabled();
  });

  it("should change the ticket status successfully", async () => {
    const user = userEvent.setup();

    renderDialog();

    await waitFor(() => {
      expect(mocks.getAllActiveStatuses).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "IN_PROGRESS",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Update status",
      }),
    );

    await waitFor(() => {
      expect(mocks.changeTicketStatus).toHaveBeenCalledWith(42, {
        statusId: 2,
      });
    });

    expect(onTicketUpdated).toHaveBeenCalledTimes(1);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not load statuses for USER role", async () => {
    mocks.useAuth.mockReturnValue({
      user: {
        userId: 7,
        username: "john",
        role: USER_ROLES.USER,
      },
    });

    renderDialog();

    expect(mocks.getAllActiveStatuses).not.toHaveBeenCalled();

    expect(mocks.changeTicketStatus).not.toHaveBeenCalled();
  });

  it("should show an error when statuses cannot be loaded", async () => {
    mocks.getAllActiveStatuses.mockRejectedValue(new Error("Network error"));

    renderDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load statuses",
    );

    expect(mocks.changeTicketStatus).not.toHaveBeenCalled();
  });

  it("should show an error when updating status fails", async () => {
    const user = userEvent.setup();

    mocks.changeTicketStatus.mockRejectedValue(new Error("Network error"));

    renderDialog();

    await waitFor(() => {
      expect(mocks.getAllActiveStatuses).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox"));

    await user.click(
      await screen.findByRole("option", {
        name: "RESOLVED",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Update status",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to update status",
    );

    expect(mocks.changeTicketStatus).toHaveBeenCalledWith(42, {
      statusId: 3,
    });

    expect(onTicketUpdated).not.toHaveBeenCalled();

    expect(onClose).not.toHaveBeenCalled();
  });
});
