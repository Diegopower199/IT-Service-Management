import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  createTicketComment,
  getAllTicketsCommentsById,
} from "@/app/modules/tickets/services/ticketCommentsService";

import type {
  CreateTicketCommentRequest,
  TicketCommentResponse,
} from "@/types/ticketCommentTypes";

import type { PageResponse, PaginationParams } from "@/types/paginationTypes";

vi.mock("@/config/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

describe("ticketCommentsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTicketsCommentsById", () => {
    it("should return paginated ticket comments", async () => {
      const ticketId = 1;

      const pagination: PaginationParams = {
        page: 0,
        size: 10,
        sort: "createdAt,desc",
      };

      const comment: TicketCommentResponse = {
        idComment: 1,
        ticketId: 1,
        user: {
          idUser: 2,
          username: "john",
        },
        comment: "Ticket comment",
        internal: false,
        createdAt: "2026-11-03T12:00:00",
      };

      const response: PageResponse<TicketCommentResponse> = {
        content: [comment],

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

      const result = await getAllTicketsCommentsById(ticketId, pagination);

      expect(mockedGet).toHaveBeenCalledWith("/ticket-comments/ticket/1", {
        params: pagination,
      });

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("createTicketComment", () => {
    it("should create ticket comment", async () => {
      const ticketId = 1;

      const request: CreateTicketCommentRequest = {
        comment: "New ticket comment",
        internal: false,
      };

      const response: TicketCommentResponse = {
        idComment: 10,
        ticketId: 1,
        user: {
          idUser: 2,
          username: "john",
        },
        comment: "New ticket comment",
        internal: false,
        createdAt: "2026-11-03T12:00:00",
      };

      mockedPost.mockResolvedValue({
        data: response,
      });

      const result = await createTicketComment(ticketId, request);

      expect(mockedPost).toHaveBeenCalledWith(
        "/ticket-comments/ticket/1",
        request,
      );

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });
});
