import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AddTicketCommentDialog from "@/app/modules/tickets/components/actions/AddTicketCommentDialog";
import { USER_ROLES } from "@/types/roleTypes";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  createTicketComment: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({ useAuth: mocks.useAuth }));
vi.mock("@/app/modules/tickets/services/ticketCommentsService", () => ({
  createTicketComment: mocks.createTicketComment,
}));
vi.mock("@/utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("next-intl", () => {
  const messages: Record<string, string> = {
    title: "Add comment",
    comment: "Comment",
    commentRequired: "Comment is required",
    internalComment: "Internal comment",
    cancel: "Cancel",
    addComment: "Add comment",
    adding: "Adding...",
    createError: "Failed to add comment",
  };
  return {
    useTranslations: () => (key: string, values?: { ticketId?: number }) =>
      key === "subtitle"
        ? `Ticket #${values?.ticketId}`
        : (messages[key] ?? key),
  };
});

describe("AddTicketCommentDialog", () => {
  const onClose = vi.fn();
  const onCommentsUpdated = vi.fn();

  const renderDialog = () =>
    render(
      <AddTicketCommentDialog
        open
        ticketId={42}
        onClose={onClose}
        onCommentsUpdated={onCommentsUpdated}
      />,
    );

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.useAuth.mockReturnValue({
      user: { userId: 5, username: "tech", role: USER_ROLES.TECHNICIAN },
    });
    mocks.createTicketComment.mockResolvedValue(undefined);
  });

  it("renders the comment field and internal option for technicians", () => {
    renderDialog();

    expect(
      screen.getByRole("heading", { name: "Add comment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Comment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Internal comment" }),
    ).toBeInTheDocument();
  });

  it("requires non-empty comment text", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(screen.getByText("Comment is required")).toBeInTheDocument();
    expect(mocks.createTicketComment).not.toHaveBeenCalled();
  });

  it("creates a public comment for USER", async () => {
    const user = userEvent.setup();
    mocks.useAuth.mockReturnValue({
      user: { userId: 8, username: "client", role: USER_ROLES.USER },
    });
    renderDialog();

    expect(
      screen.queryByRole("checkbox", { name: "Internal comment" }),
    ).not.toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: "Comment" }),
      "Please help",
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => {
      expect(mocks.createTicketComment).toHaveBeenCalledWith(42, {
        comment: "Please help",
        internal: false,
      });
      expect(onCommentsUpdated).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("allows a technician to create an internal comment", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(
      screen.getByRole("textbox", { name: "Comment" }),
      "Only for support",
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Internal comment" }),
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => {
      expect(mocks.createTicketComment).toHaveBeenCalledWith(42, {
        comment: "Only for support",
        internal: true,
      });
    });
    expect(onCommentsUpdated).toHaveBeenCalledTimes(1);
  });

  it("shows an error and keeps the dialog open when creation fails", async () => {
    const user = userEvent.setup();
    mocks.createTicketComment.mockRejectedValue(new Error("Network error"));
    renderDialog();

    await user.type(
      screen.getByRole("textbox", { name: "Comment" }),
      "Test comment",
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to add comment",
    );
    expect(onCommentsUpdated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes without creating a comment on cancel", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.createTicketComment).not.toHaveBeenCalled();
  });
});
