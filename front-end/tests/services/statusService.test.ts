import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  activateStatus,
  createStatus,
  deactivateStatus,
  getAllActiveStatuses,
  getAllStatuses,
  updateStatus,
} from "@/app/modules/statuses/services/statusService";

import type { StatusRequest, StatusResponse } from "@/types/statusTypes";

vi.mock("@/config/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
const mockedPut = vi.mocked(api.put);
const mockedPatch = vi.mocked(api.patch);

describe("statusService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllStatuses", () => {
    it("should return all statuses", async () => {
      const statuses: StatusResponse[] = [
        {
          idStatus: 1,
          name: "OPEN",
          active: true,
        },
        {
          idStatus: 2,
          name: "CLOSED",
          active: true,
        },
      ];

      mockedGet.mockResolvedValue({
        data: statuses,
      });

      const result = await getAllStatuses();

      expect(mockedGet).toHaveBeenCalledWith("/statuses");
      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(statuses);
    });
  });

  describe("getAllActiveStatuses", () => {
    it("should return all active statuses", async () => {
      const statuses: StatusResponse[] = [
        {
          idStatus: 1,
          name: "OPEN",
          active: true,
        },
      ];

      mockedGet.mockResolvedValue({
        data: statuses,
      });

      const result = await getAllActiveStatuses();

      expect(mockedGet).toHaveBeenCalledWith("/statuses/active");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(statuses);
    });
  });

  describe("createStatus", () => {
    it("should create status", async () => {
      const request: StatusRequest = {
        name: "WAITING",
      };

      const response: StatusResponse = {
        idStatus: 3,
        name: "WAITING",
        active: true,
      };

      mockedPost.mockResolvedValue({
        data: response,
      });

      const result = await createStatus(request);

      expect(mockedPost).toHaveBeenCalledWith("/statuses", request);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("updateStatus", () => {
    it("should update status", async () => {
      const request: StatusRequest = {
        name: "RESOLVED",
      };

      const response: StatusResponse = {
        idStatus: 1,
        name: "RESOLVED",
        active: true,
      };

      mockedPut.mockResolvedValue({
        data: response,
      });

      const result = await updateStatus(1, request);

      expect(mockedPut).toHaveBeenCalledWith("/statuses/1", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("activateStatus", () => {
    it("should activate status", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await activateStatus(1);

      expect(mockedPatch).toHaveBeenCalledWith("/statuses/1/activate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivateStatus", () => {
    it("should deactivate status", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await deactivateStatus(1);

      expect(mockedPatch).toHaveBeenCalledWith("/statuses/1/deactivate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });
});
