import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TicketsContent from "@/app/modules/tickets/components/content/TicketsContent";
import { USER_ROLES } from "@/types/roleTypes";
import type { TicketResponse } from "@/types/ticketTypes";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
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
  const router = { replace: mocks.replace };
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
    ticketsLoadError: "Failed to load tickets",
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
  return { useTranslations: () => translate };
});

// DataGrid is a third-party widget; keep the real page and real TicketFiltersBar.
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({ rows }: { rows: TicketResponse[] }) => (
    <div data-testid="tickets-grid">
      {rows.map((ticket) => (
        <div key={ticket.idTicket}>{ticket.title}</div>
      ))}
    </div>
  ),
  GridActionsCellItem: () => null,
}));
vi.mock("@/app/modules/tickets/components/form/TicketForm", () => ({
  default: () => <div>Ticket form</div>,
}));
vi.mock("@/app/modules/tickets/components/details/TicketDetails", () => ({
  default: () => <div>Ticket details</div>,
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

  it("shows an error if the ticket list cannot be loaded", async () => {
    mocks.getAllTickets.mockRejectedValue(new Error("Network error"));
    render(<TicketsContent />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load tickets",
    );
  });
});
