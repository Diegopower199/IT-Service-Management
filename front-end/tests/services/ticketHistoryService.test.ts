import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import { getAllTicketHistoryById } from "@/app/modules/tickets/services/ticketHistoryService";

import type { PageResponse, PaginationParams } from "@/types/paginationTypes";

import type { TicketHistoryResponse } from "@/types/ticketHistoryTypes";

vi.mock("@/config/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);

describe("ticketHistoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTicketHistoryById", () => {
    it("should return paginated ticket history", async () => {
      const ticketId = 1;

      const pagination: PaginationParams = {
        page: 0,
        size: 10,
        sort: "createdAt,desc",
      };

      const historyItem: TicketHistoryResponse = {
        idHistory: 1,
        ticketId: 1,
        user: {
          idUser: 2,
          username: "john",
        },
        action: "STATUS_CHANGED",
        fieldName: "status",
        oldValue: "OPEN",
        newValue: "IN_PROGRESS",
        createdAt: "2026-11-03T12:00:00",
      };

      const response: PageResponse<TicketHistoryResponse> = {
        content: [historyItem],

        empty: false,
        first: true,
        last: true,

        number: 0,
        numberOfElements: 1,
        size: 10,

        totalElements: 1,
        totalPages: 1,

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

        sort: {
          empty: false,
          sorted: true,
          unsorted: false,
        },
      };

      mockedGet.mockResolvedValue({
        data: response,
      });

      const result = await getAllTicketHistoryById(ticketId, pagination);

      expect(mockedGet).toHaveBeenCalledWith("/ticket-history/ticket/1", {
        params: pagination,
      });

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });
});
