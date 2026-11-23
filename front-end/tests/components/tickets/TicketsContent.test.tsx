import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardQuickActions from "@/app/modules/dashboard/components/DashboardQuickActions";
import TicketsContent from "@/app/modules/tickets/components/content/TicketsContent";
import TicketDetailsContent from "@/app/modules/tickets/components/details/TicketDetailsContent";
import TicketRouteGuard from "@/app/modules/tickets/components/shared/TicketRouteGuard";
import { parseTicketId } from "@/app/modules/tickets/components/shared/ticketNavigation";
import AppSidebar from "@/layouts/AppSidebar";
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
  getUnassignedTickets: vi.fn(),
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
    usePathname: () => "/tickets",
    useSearchParams: () => mocks.searchParams,
  };
});
vi.mock("next/link", () => ({
  default: ({ onNavigate, ...props }: ComponentProps<"a"> & { onNavigate?: () => void }) => (
    <a {...props} onClick={(event) => {
      event.preventDefault();
      onNavigate?.();
    }} />
  ),
}));
vi.mock("@/app/modules/tickets/services/ticketService", () => ({
  getAllTickets: mocks.getAllTickets,
  getAssignedTickets: mocks.getAssignedTickets,
  getOwnTickets: mocks.getOwnTickets,
  getUnassignedTickets: mocks.getUnassignedTickets,
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
    unassignedTickets: "Unassigned Tickets",
    viewAssigned: "View assigned tickets",
    viewUnassigned: "View unassigned tickets",
    myTickets: "My tickets",
    createTicket: "Create ticket",
    view: "View",
    edit: "Edit",
    ticketsLoadError: "Failed to load tickets",
    loadError: "Failed to load ticket details",
    backToTickets: "Back to tickets",
    denied: "Access denied",
    notFound: "Ticket not found",
    invalidId: "Invalid ticket ID",
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

function renderTicketRoute(rawId: string) {
  return render(
    <TicketRouteGuard ticketId={parseTicketId(rawId)}>
      <TicketDetailsContent ticketId={Number(rawId)} />
    </TicketRouteGuard>,
  );
}

describe("TicketsContent", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
    mocks.searchParams = new URLSearchParams();
    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 1, username: "admin", role: USER_ROLES.ADMIN },
    });
    mocks.getAllTickets.mockResolvedValue(pagedTickets);
    mocks.getAssignedTickets.mockResolvedValue(pagedTickets);
    mocks.getOwnTickets.mockResolvedValue(pagedTickets);
    mocks.getUnassignedTickets.mockResolvedValue(pagedTickets);
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
    const dashboard = render(<DashboardQuickActions role={USER_ROLES.TECHNICIAN} />);
    expect(screen.getByRole("link", { name: "View assigned tickets" })).toHaveAttribute("href", "/tickets");
    dashboard.unmount();
    render(<TicketsContent />);

    expect(
      screen.getByRole("heading", { name: "Assigned tickets" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.getAssignedTickets).toHaveBeenCalledTimes(1),
    );
    expect(mocks.getAllTickets).not.toHaveBeenCalled();
    expect(mocks.getOwnTickets).not.toHaveBeenCalled();
    expect(mocks.getUnassignedTickets).not.toHaveBeenCalled();
  });

  it("opens and restores the unassigned list without adding its selection to the URL", async () => {
    const user = userEvent.setup();
    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 7, username: "tech", role: USER_ROLES.TECHNICIAN },
    });
    const dashboard = render(<DashboardQuickActions role={USER_ROLES.TECHNICIAN} />);
    const unassignedLink = screen.getByRole("link", { name: "View unassigned tickets" });
    expect(unassignedLink).toHaveAttribute("href", "/tickets");
    await user.click(unassignedLink);
    dashboard.unmount();
    const list = render(<TicketsContent />);

    expect(screen.getByRole("heading", { name: "Unassigned Tickets" })).toBeInTheDocument();
    await screen.findByText("Printer issue");
    expect(mocks.getUnassignedTickets).toHaveBeenCalledWith(expect.objectContaining({ page: 0 }));
    expect(mocks.getAssignedTickets).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Search by title" }), "Printer");
    await user.click(screen.getByRole("button", { name: "Apply Filters" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/tickets?title=Printer");
    mocks.searchParams = new URLSearchParams("title=Printer");
    list.rerender(<TicketsContent />);
    await waitFor(() => expect(mocks.getUnassignedTickets).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Printer" }),
    ));

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/tickets?title=Printer&page=1", { scroll: false });

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/tickets");
    mocks.searchParams = new URLSearchParams();
    list.rerender(<TicketsContent />);

    await user.click(screen.getByRole("button", { name: "View" }));
    list.unmount();
    const detail = renderTicketRoute("42");
    render(<AppSidebar />);
    const ticketsLink = screen.getByRole("link", { name: "tickets" });
    await user.click(ticketsLink);
    await user.click(await screen.findByRole("button", { name: "Back to tickets" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/tickets");
    detail.unmount();
    render(<TicketsContent />);
    expect(screen.getByRole("heading", { name: "Unassigned Tickets" })).toBeInTheDocument();

    await user.click(ticketsLink);
    expect(screen.getByRole("heading", { name: "Assigned tickets" })).toBeInTheDocument();
    await waitFor(() => expect(mocks.getAssignedTickets).toHaveBeenCalledTimes(1));
  });

  it("loads own tickets for USER and skips status/priority catalogs", async () => {
    mocks.searchParams = new URLSearchParams("assignment=unassigned");
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
    expect(mocks.getUnassignedTickets).not.toHaveBeenCalled();
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
      "/tickets?title=Printer&status=OPEN",
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
    expect(mocks.replace).toHaveBeenCalledWith("/tickets?title=Printer&page=1", { scroll: false });
    mocks.searchParams = new URLSearchParams("title=Printer&page=1");
    view.rerender(<TicketsContent />);
    await waitFor(() => {
      expect(mocks.getAllTickets).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, title: "Printer" }),
      );
    });

    await user.click(await screen.findByRole("button", { name: "View" }));
    expect(mocks.push).toHaveBeenCalledWith("/tickets/42");
    view.unmount();

    const detail = renderTicketRoute("42");

    await user.click(await screen.findByRole("button", { name: "Edit ticket" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("heading", { name: "Ticket #42" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to tickets" }));

    expect(mocks.replace).toHaveBeenLastCalledWith("/tickets?title=Printer&page=1");
    detail.unmount();
    render(<TicketsContent />);
    expect(screen.getByText("Page 2")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Search by title" }),
    ).toHaveValue("Printer");
  });

  it("fetches a directly opened detail and returns to the default list", async () => {
    const user = userEvent.setup();
    renderTicketRoute("42");

    expect(
      await screen.findByRole("heading", { name: "Ticket #42" }),
    ).toBeInTheDocument();
    expect(mocks.getTicketById).toHaveBeenCalledWith(42);
    expect(mocks.getAllTickets).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Back to tickets" }));
    expect(mocks.replace).toHaveBeenCalledWith("/tickets");
  });

  it.each([[403, "Access denied"], [404, "Ticket not found"]])(
    "shows the localized detail error for HTTP %i without private data",
    async (status, message) => {
      mocks.useAuth.mockReturnValue({
        isAuthReady: true,
        user: { userId: 5, username: "john", role: USER_ROLES.USER },
      });
      mocks.getTicketById.mockRejectedValue({
        isAxiosError: true,
        response: { status, data: { message: "Internal server message" } },
      });

      renderTicketRoute("42");

      expect(await screen.findByRole("alert")).toHaveTextContent(message);
      expect(screen.queryByRole("heading", { name: "Ticket #42" })).not.toBeInTheDocument();
      expect(mocks.getOwnTickets).not.toHaveBeenCalled();
    },
  );

  it("does not use the originating list of a different account", async () => {
    const user = userEvent.setup();
    mocks.searchParams = new URLSearchParams("status=OPEN&page=1&pageSize=10");
    const list = render(<TicketsContent />);
    await user.click(await screen.findByRole("button", { name: "View" }));
    list.unmount();

    mocks.useAuth.mockReturnValue({
      isAuthReady: true,
      user: { userId: 2, username: "another-admin", role: USER_ROLES.ADMIN },
    });
    renderTicketRoute("42");

    await user.click(await screen.findByRole("button", { name: "Back to tickets" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/tickets");
  });

  it.each(["0", "1e2", "unsafe", "9007199254740992"])("rejects invalid route ID %s", (id) => {
    renderTicketRoute(id);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid ticket ID");
    expect(mocks.getTicketById).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated direct detail without requesting data", async () => {
    mocks.useAuth.mockReturnValue({ isAuthReady: true, user: null });
    renderTicketRoute("42");

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
    expect(mocks.getTicketById).not.toHaveBeenCalled();
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
    const view = renderTicketRoute("42");

    await user.click(await screen.findByRole("button", { name: "Edit ticket" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mocks.replace).toHaveBeenCalledWith("/tickets");
    view.unmount();
    render(<TicketsContent />);
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
