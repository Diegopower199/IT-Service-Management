import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  assignTicketTechnician,
  changeTicketPriority,
  changeTicketStatus,
  createTicket,
  getAllTickets,
  getAssignedTickets,
  getOwnTickets,
  getTicketById,
  getTicketStatistics,
  updateTicket,
  type TicketQueryParams,
} from "@/app/modules/tickets/services/ticketService";

import type {
  AssignTicketRequest,
  ChangePriorityRequest,
  ChangeStatusRequest,
  CreateTicketRequest,
  TicketResponse,
  TicketStatisticsResponse,
  UpdateTicketRequest,
} from "@/types/ticketTypes";

import type { PageResponse } from "@/types/paginationTypes";

vi.mock("@/config/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
const mockedPatch = vi.mocked(api.patch);

describe("ticketService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ticket: TicketResponse = {
    idTicket: 1,
    title: "Printer issue",
    description: "Printer does not work",
    createdAt: "2026-11-03T10:00:00",
    lastUpdated: "2026-11-03T11:00:00",

    createdBy: {
      idUser: 1,
      username: "admin",
    },

    requestedFor: {
      idUser: 2,
      username: "john",
    },

    assignedTo: {
      idUser: 3,
      username: "technician",
    },

    category: {
      idCategory: 1,
      name: "Hardware",
      active: true,
    },

    priority: {
      idPriority: 2,
      name: "HIGH",
      active: true,
    },

    status: {
      idStatus: 1,
      name: "OPEN",
      active: true,
    },
  };

  const pageResponse: PageResponse<TicketResponse> = {
    content: [ticket],

    empty: false,
    first: true,
    last: true,

    number: 0,
    numberOfElements: 1,

    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 10,
      paged: true,
      unpaged: false,

      sort: {
        empty: false,
        sorted: true,
        unsorted: false,
      },
    },

    size: 10,

    sort: {
      empty: false,
      sorted: true,
      unsorted: false,
    },

    totalElements: 1,
    totalPages: 1,
  };

  const queryParams: TicketQueryParams = {
    page: 0,
    size: 10,
    sort: "lastUpdated,desc",
    title: "Printer",
    status: "OPEN",
    priority: "HIGH",
    category: "Hardware",
  };

  describe("getAllTickets", () => {
    it("should return all tickets", async () => {
      mockedGet.mockResolvedValue({
        data: pageResponse,
      });

      const result = await getAllTickets(queryParams);

      expect(mockedGet).toHaveBeenCalledWith("/tickets", {
        params: queryParams,
      });

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(pageResponse);
    });
  });

  describe("getOwnTickets", () => {
    it("should return tickets related to current user", async () => {
      mockedGet.mockResolvedValue({
        data: pageResponse,
      });

      const result = await getOwnTickets(queryParams);

      expect(mockedGet).toHaveBeenCalledWith("/tickets/my", {
        params: queryParams,
      });

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(pageResponse);
    });
  });

  describe("getAssignedTickets", () => {
    it("should return tickets assigned to current technician", async () => {
      mockedGet.mockResolvedValue({
        data: pageResponse,
      });

      const result = await getAssignedTickets(queryParams);

      expect(mockedGet).toHaveBeenCalledWith("/tickets/assigned", {
        params: queryParams,
      });

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(pageResponse);
    });
  });

  describe("getTicketById", () => {
    it("should return ticket by id", async () => {
      mockedGet.mockResolvedValue({
        data: ticket,
      });

      const result = await getTicketById(1);

      expect(mockedGet).toHaveBeenCalledWith("/tickets/1");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(ticket);
    });
  });

  describe("getTicketStatistics", () => {
    it("should return ticket statistics", async () => {
      const statistics: TicketStatisticsResponse = {
        totalTickets: 100,
        openTickets: 40,
        inProgressTickets: 30,
        criticalTickets: 10,
      };

      mockedGet.mockResolvedValue({
        data: statistics,
      });

      const result = await getTicketStatistics();

      expect(mockedGet).toHaveBeenCalledWith("/tickets/statistics");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(statistics);
    });
  });

  describe("createTicket", () => {
    it("should create ticket", async () => {
      const request: CreateTicketRequest = {
        title: "Printer issue",
        description: "Printer does not work",
        requestedForId: 2,
        categoryId: 1,
        priorityId: 2,
      };

      mockedPost.mockResolvedValue({
        data: ticket,
      });

      const result = await createTicket(request);

      expect(mockedPost).toHaveBeenCalledWith("/tickets", request);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(ticket);
    });
  });

  describe("updateTicket", () => {
    it("should update ticket", async () => {
      const request: UpdateTicketRequest = {
        title: "Updated printer issue",
        description: "Updated description",
        categoryId: 2,
      };

      const updatedTicket: TicketResponse = {
        ...ticket,
        title: "Updated printer issue",
        description: "Updated description",

        category: {
          idCategory: 2,
          name: "Software",
          active: true,
        },
      };

      mockedPatch.mockResolvedValue({
        data: updatedTicket,
      });

      const result = await updateTicket(1, request);

      expect(mockedPatch).toHaveBeenCalledWith("/tickets/1", request);

      expect(mockedPatch).toHaveBeenCalledTimes(1);

      expect(result).toEqual(updatedTicket);
    });
  });

  describe("assignTicketTechnician", () => {
    it("should assign technician to ticket", async () => {
      const request: AssignTicketRequest = {
        assignedToId: 3,
      };

      mockedPatch.mockResolvedValue({
        data: ticket,
      });

      const result = await assignTicketTechnician(1, request);

      expect(mockedPatch).toHaveBeenCalledWith("/tickets/1/assign", request);

      expect(mockedPatch).toHaveBeenCalledTimes(1);

      expect(result).toEqual(ticket);
    });
  });

  describe("changeTicketStatus", () => {
    it("should change ticket status", async () => {
      const request: ChangeStatusRequest = {
        statusId: 2,
      };

      const updatedTicket: TicketResponse = {
        ...ticket,

        status: {
          idStatus: 2,
          name: "IN_PROGRESS",
          active: true,
        },
      };

      mockedPatch.mockResolvedValue({
        data: updatedTicket,
      });

      const result = await changeTicketStatus(1, request);

      expect(mockedPatch).toHaveBeenCalledWith("/tickets/1/status", request);

      expect(mockedPatch).toHaveBeenCalledTimes(1);

      expect(result).toEqual(updatedTicket);
    });
  });

  describe("changeTicketPriority", () => {
    it("should change ticket priority", async () => {
      const request: ChangePriorityRequest = {
        priorityId: 4,
      };

      const updatedTicket: TicketResponse = {
        ...ticket,

        priority: {
          idPriority: 4,
          name: "CRITICAL",
          active: true,
        },
      };

      mockedPatch.mockResolvedValue({
        data: updatedTicket,
      });

      const result = await changeTicketPriority(1, request);

      expect(mockedPatch).toHaveBeenCalledWith("/tickets/1/priority", request);

      expect(mockedPatch).toHaveBeenCalledTimes(1);

      expect(result).toEqual(updatedTicket);
    });
  });
});
