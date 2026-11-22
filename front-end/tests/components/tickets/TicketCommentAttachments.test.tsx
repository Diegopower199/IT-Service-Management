import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TicketCommentAttachments from "@/app/modules/tickets/components/attachments/TicketCommentAttachments";
import messages from "../../../messages/en/tickets.json";

const mocks = vi.hoisted(() => ({
  getTicketCommentAttachments: vi.fn(),
}));

vi.mock("@/app/modules/tickets/services/ticketCommentAttachmentService", () => ({
  getTicketCommentAttachments: mocks.getTicketCommentAttachments,
}));

function renderAttachments() {
  return render(
    <NextIntlClientProvider locale="en" timeZone="UTC" messages={{ Tickets: messages }}>
      <TicketCommentAttachments ticketId={42} commentId={17} />
    </NextIntlClientProvider>,
  );
}

describe("TicketCommentAttachments", () => {
  beforeEach(() => mocks.getTicketCommentAttachments.mockReset());

  it("checks for files on demand and replaces the control when the comment is empty", async () => {
    mocks.getTicketCommentAttachments.mockResolvedValue([]);
    const user = userEvent.setup();
    renderAttachments();

    expect(mocks.getTicketCommentAttachments).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Check attachments" })).toHaveFocus();
    await user.keyboard("{Enter}");

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("This comment has no attachments.");
    expect(status).toHaveFocus();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(mocks.getTicketCommentAttachments).toHaveBeenCalledExactlyOnceWith(42, 17);
  });

  it("shows the count and reopens loaded files without a second request", async () => {
    mocks.getTicketCommentAttachments.mockResolvedValue([
      { idAttachment: 7, fileName: "diagnostics.pdf", contentType: "application/pdf", fileSize: 1536 },
    ]);
    const user = userEvent.setup();
    renderAttachments();

    await user.click(screen.getByRole("button", { name: "Check attachments" }));
    const collapse = await screen.findByRole("button", { name: "Hide attachments (1 file)" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("1.5 KB")).toBeVisible();
    expect(screen.getByRole("button", { name: "Preview diagnostics.pdf" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Download diagnostics.pdf" })).toBeVisible();

    await user.click(collapse);
    const expand = screen.getByRole("button", { name: "Show attachments (1 file)" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByText("diagnostics.pdf")).not.toBeInTheDocument());
    await user.click(expand);

    expect(await screen.findByText("diagnostics.pdf")).toBeVisible();
    expect(mocks.getTicketCommentAttachments).toHaveBeenCalledTimes(1);
  });

  it("leaves the check available after an error", async () => {
    mocks.getTicketCommentAttachments.mockRejectedValueOnce(new Error("Network error"));
    mocks.getTicketCommentAttachments.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    renderAttachments();

    await user.click(screen.getByRole("button", { name: "Check attachments" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load attachments.");
    await user.click(screen.getByRole("button", { name: "Check attachments" }));

    expect(await screen.findByRole("status")).toHaveTextContent("This comment has no attachments.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
