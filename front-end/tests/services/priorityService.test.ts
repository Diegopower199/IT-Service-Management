import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  activatePriority,
  createPriority,
  deactivatePriority,
  getAllActivePriorities,
  getAllPriorities,
  updatePriority,
} from "@/app/modules/priorities/services/priorityService";

import type { PriorityRequest, PriorityResponse } from "@/types/priorityTypes";

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

describe("priorityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllPriorities", () => {
    it("should return all priorities", async () => {
      const priorities: PriorityResponse[] = [
        {
          idPriority: 1,
          name: "LOW",
          active: true,
        },
        {
          idPriority: 2,
          name: "HIGH",
          active: false,
        },
      ];

      mockedGet.mockResolvedValue({
        data: priorities,
      });

      const result = await getAllPriorities();

      expect(mockedGet).toHaveBeenCalledWith("/priorities");
      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(priorities);
    });
  });

  describe("getAllActivePriorities", () => {
    it("should return all active priorities", async () => {
      const priorities: PriorityResponse[] = [
        {
          idPriority: 1,
          name: "LOW",
          active: true,
        },
      ];

      mockedGet.mockResolvedValue({
        data: priorities,
      });

      const result = await getAllActivePriorities();

      expect(mockedGet).toHaveBeenCalledWith("/priorities/active");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(priorities);
    });
  });

  describe("createPriority", () => {
    it("should create priority", async () => {
      const request: PriorityRequest = {
        name: "HIGH",
      };

      const response: PriorityResponse = {
        idPriority: 1,
        name: "HIGH",
        active: true,
      };

      mockedPost.mockResolvedValue({
        data: response,
      });

      const result = await createPriority(request);

      expect(mockedPost).toHaveBeenCalledWith("/priorities", request);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("updatePriority", () => {
    it("should update priority", async () => {
      const request: PriorityRequest = {
        name: "CRITICAL",
      };

      const response: PriorityResponse = {
        idPriority: 1,
        name: "CRITICAL",
        active: true,
      };

      mockedPut.mockResolvedValue({
        data: response,
      });

      const result = await updatePriority(1, request);

      expect(mockedPut).toHaveBeenCalledWith("/priorities/1", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("activatePriority", () => {
    it("should activate priority", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await activatePriority(1);

      expect(mockedPatch).toHaveBeenCalledWith("/priorities/1/activate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivatePriority", () => {
    it("should deactivate priority", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await deactivatePriority(1);

      expect(mockedPatch).toHaveBeenCalledWith("/priorities/1/deactivate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });
});
