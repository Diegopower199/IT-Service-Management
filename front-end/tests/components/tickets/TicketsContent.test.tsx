import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TicketsContent from "@/app/modules/tickets/components/content/TicketsContent";
import { USER_ROLES } from "@/types/roleTypes";
import type { TicketResponse } from "@/types/ticketTypes";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
  getAllTickets: vi.fn(),
  getAssignedTickets: vi.fn(),
  getOwnTickets: vi.fn(),
  getTicketById: vi.fn(),
  getAllActiveCategories: vi.fn(),
  getAllActiveStatuses: vi.fn(),
  getAllActivePriorities: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({ useAuth: mocks.useAuth }));
vi.mock("next/navigation", () => {
  const router = { push: mocks.push, replace: mocks.replace };
  return {
    useRouter: () => router,
    useSearchParams: () => mocks.searchParams,
  };
});
vi.mock("@/app/modules/tickets/services/ticketService", () => ({
  getAllTickets: mocks.getAllTickets,
  getAssignedTickets: mocks.getAssignedTickets,
  getOwnTickets: mocks.getOwnTickets,
  getTicketById: mocks.getTicketById,
}));
vi.mock("@/app/modules/categories/services/categoryService", () => ({
  getAllActiveCategories: mocks.getAllActiveCategories,
}));
vi.mock("@/app/modules/statuses/services/statusService", () => ({
  getAllActiveStatuses: mocks.getAllActiveStatuses,
}));
vi.mock("@/app/modules/priorities/services/priorityService", () => ({
  getAllActivePriorities: mocks.getAllActivePriorities,
}));
vi.mock("@/utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("next-intl", () => {
  const labels: Record<string, string> = {
    allTickets: "All tickets",
    assignedTickets: "Assigned tickets",
    myTickets: "My tickets",
    createTicket: "Create ticket",
    view: "View",
    edit: "Edit",
    ticketsLoadError: "Failed to load tickets",
    loadError: "Failed to load ticket details",
    title: "Filters",
    searchByTitle: "Search by title",
    status: "Status",
    priority: "Priority",
    category: "Category",
    allStatuses: "All statuses",
    allPriorities: "All priorities",
    allCategories: "All categories",
    clear: "Clear",
    applyFilters: "Apply Filters",
  };
  const translate = Object.assign((key: string) => labels[key] ?? key, {
    has: () => false,
  });
  return { useLocale: () => "en", useTranslations: () => translate };
});

// DataGrid is a third-party widget; keep the real page and real TicketFiltersBar.
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({
    rows,
    columns,
    paginationModel,
    onPaginationModelChange,
  }: {
    rows: TicketResponse[];
    columns: GridColDef<TicketResponse>[];
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
  }) => {
    const actions = columns.find((column) => column.field === "actions");

    return (
      <div data-testid="tickets-grid">
        {rows.map((ticket) => (
          <div key={ticket.idTicket}>
            {ticket.title}
            {actions && "getActions" in actions &&
              actions.getActions({ id: ticket.idTicket, row: ticket, columns })}
          </div>
        ))}
        <span>Page {paginationModel.page + 1}</span>
        <button
          type="button"
          onClick={() =>
            onPaginationModelChange({
              ...paginationModel,
              page: paginationModel.page + 1,
            })
          }
        >
          Next page
        </button>
      </div>
    );
  },
  GridActionsCellItem: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
}));
vi.mock("@/app/modules/tickets/components/form/TicketForm", () => ({
  default: ({ onClose, onCancel = onClose }: { onCancel?: () => void; onClose: () => void }) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" onClick={onClose}>
        Save changes
      </button>
    </div>
  ),
}));
vi.mock("@/app/modules/tickets/components/details/TicketDetails", () => ({
  default: ({
    ticket,
    onEdit,
    onClose,
  }: {
    ticket: TicketResponse;
    onEdit: () => void;
    onClose: () => void;
  }) => (
    <div>
      <h2>Ticket #{ticket.idTicket}</h2>
      <button type="button" onClick={onEdit}>
        Edit ticket
      </button>
      <button type="button" onClick={onClose}>
        Back to tickets
      </button>
    </div>
  ),
}));

const ticket: TicketResponse = {
  idTicket: 42,
  title: "Printer issue",
  description: "Printer does not work",
  createdAt: "2026-11-03T10:00:00",
  lastUpdated: "2026-11-03T11:00:00",
  createdBy: { idUser: 5, username: "john" },
  requestedFor: { idUser: 5, username: "john" },
  assignedTo: null,
  category: { idCategory: 1, name: "Hardware", active: true },
  status: { idStatus: 1, name: "OPEN", active: true },
  priority: { idPriority: 2, name: "HIGH", active: true },
};

const pagedTickets = { content: [ticket], totalElements: 1 };

describe("TicketsContent", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.searchParams = new URLSearchParams();
    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 1, username: "admin", role: USER_ROLES.ADMIN },
    });
    mocks.getAllTickets.mockResolvedValue(pagedTickets);
    mocks.getAssignedTickets.mockResolvedValue(pagedTickets);
    mocks.getOwnTickets.mockResolvedValue(pagedTickets);
    mocks.getTicketById.mockResolvedValue(ticket);
    mocks.getAllActiveCategories.mockResolvedValue([ticket.category]);
    mocks.getAllActiveStatuses.mockResolvedValue([ticket.status]);
    mocks.getAllActivePriorities.mockResolvedValue([ticket.priority]);
  });

  it("loads all tickets for ADMIN", async () => {
    render(<TicketsContent />);

    expect(
      screen.getByRole("heading", { name: "All tickets" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.getAllTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 20,
          sort: "lastUpdated,desc",
          title: null,
          status: null,
          priority: null,
          category: null,
        }),
      );
      expect(screen.getByText("Printer issue")).toBeInTheDocument();
    });
    expect(mocks.getAssignedTickets).not.toHaveBeenCalled();
    expect(mocks.getOwnTickets).not.toHaveBeenCalled();
  });

  it("loads assigned tickets for TECHNICIAN", async () => {
    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 7, username: "tech", role: USER_ROLES.TECHNICIAN },
    });
    render(<TicketsContent />);

    expect(
      screen.getByRole("heading", { name: "Assigned tickets" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.getAssignedTickets).toHaveBeenCalledTimes(1),
    );
    expect(mocks.getAllTickets).not.toHaveBeenCalled();
    expect(mocks.getOwnTickets).not.toHaveBeenCalled();
  });

  it("loads own tickets for USER and skips status/priority catalogs", async () => {
    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 5, username: "john", role: USER_ROLES.USER },
    });
    render(<TicketsContent />);

    expect(
      screen.getByRole("heading", { name: "My tickets" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.getOwnTickets).toHaveBeenCalledTimes(1);
      expect(mocks.getAllActiveCategories).toHaveBeenCalledTimes(1);
    });
    expect(mocks.getAllActiveStatuses).not.toHaveBeenCalled();
    expect(mocks.getAllActivePriorities).not.toHaveBeenCalled();
  });

  it("uses query-string filters for the API and navigates on Apply Filters", async () => {
    const user = userEvent.setup();
    mocks.searchParams = new URLSearchParams("status=OPEN");
    render(<TicketsContent />);

    await waitFor(() => {
      expect(mocks.getAllTickets).toHaveBeenCalledWith(
        expect.objectContaining({ status: "OPEN" }),
      );
    });
    await user.type(
      screen.getByRole("textbox", { name: "Search by title" }),
      "Printer",
    );
    await user.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(mocks.replace).toHaveBeenCalledWith(
      "/tickets?status=OPEN&title=Printer",
    );
  });

  it("redirects to login when authentication is ready but user is absent", async () => {
    mocks.useAuth.mockReturnValue({ isAuthReady: true, user: null });
    render(<TicketsContent />);

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.getAllTickets).not.toHaveBeenCalled();
  });

  it("cancels an edit back to the same detail and preserves list context", async () => {
    const user = userEvent.setup();
    mocks.searchParams = new URLSearchParams("title=Printer");
    const view = render(<TicketsContent />);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() => {
      expect(mocks.getAllTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, title: "Printer" }),
      );
    });

    await user.click(await screen.findByRole("button", { name: "View" }));
    const detailQuery = "title=Printer&ticketId=42&listPage=1&listPageSize=20";
    expect(mocks.push).toHaveBeenCalledWith(`/tickets?${detailQuery}`);
    mocks.searchParams = new URLSearchParams(detailQuery);
    view.rerender(<TicketsContent />);

    await user.click(await screen.findByRole("button", { name: "Edit ticket" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("heading", { name: "Ticket #42" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to tickets" }));

    expect(mocks.replace).toHaveBeenCalledWith("/tickets?title=Printer");
    mocks.searchParams = new URLSearchParams("title=Printer");
    view.rerender(<TicketsContent />);
    expect(screen.getByText("Page 2")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Search by title" }),
    ).toHaveValue("Printer");
  });

  it("restores a ticket and list page from a URL opened directly", async () => {
    const user = userEvent.setup();
    mocks.searchParams = new URLSearchParams(
      "status=OPEN&ticketId=42&listPage=2&listPageSize=10",
    );
    const view = render(<TicketsContent />);

    expect(
      await screen.findByRole("heading", { name: "Ticket #42" }),
    ).toBeInTheDocument();
    expect(mocks.getTicketById).toHaveBeenCalledWith(42);
    expect(mocks.getAllTickets).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Back to tickets" }));
    expect(mocks.replace).toHaveBeenCalledWith("/tickets?status=OPEN");
    mocks.searchParams = new URLSearchParams("status=OPEN");
    view.rerender(<TicketsContent />);
    await waitFor(() =>
      expect(mocks.getAllTickets).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, size: 10, status: "OPEN" }),
      ),
    );
  });

  it("shows the detail error when the requested ticket is denied", async () => {
    mocks.searchParams = new URLSearchParams("ticketId=42");
    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 5, username: "john", role: USER_ROLES.USER },
    });
    mocks.getTicketById.mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { message: "Access denied" } },
    });

    render(<TicketsContent />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
    expect(screen.queryByRole("heading", { name: "Ticket #42" })).not.toBeInTheDocument();
    expect(mocks.getOwnTickets).not.toHaveBeenCalled();
  });

  it.each(["Create ticket", "Edit"])(
    "returns to the list when cancelling %s from it",
    async (action) => {
      const user = userEvent.setup();
      render(<TicketsContent />);

      await user.click(await screen.findByRole("button", { name: action }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(
        screen.getByRole("heading", { name: "All tickets" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Ticket #42" }),
      ).not.toBeInTheDocument();
    },
  );

  it("keeps the existing return to the list after saving an edit from detail", async () => {
    const user = userEvent.setup();
    mocks.searchParams = new URLSearchParams("ticketId=42");
    const view = render(<TicketsContent />);

    await user.click(await screen.findByRole("button", { name: "Edit ticket" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mocks.replace).toHaveBeenCalledWith("/tickets");
    mocks.searchParams = new URLSearchParams();
    view.rerender(<TicketsContent />);
    expect(
      screen.getByRole("heading", { name: "All tickets" }),
    ).toBeInTheDocument();
  });

  it("shows an error if the ticket list cannot be loaded", async () => {
    mocks.getAllTickets.mockRejectedValue(new Error("Network error"));
    render(<TicketsContent />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load tickets",
    );
  });
});
