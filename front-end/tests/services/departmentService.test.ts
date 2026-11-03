import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  activateDepartment,
  createDepartment,
  deactivateDepartment,
  getAllActiveDepartments,
  getAllDepartments,
  updateDepartment,
} from "@/app/modules/departments/services/departmentService";

import type {
  DepartmentRequest,
  DepartmentResponse,
} from "@/types/departmentTypes";

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

describe("departmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllDepartments", () => {
    it("should return all departments", async () => {
      const departments: DepartmentResponse[] = [
        {
          idDepartment: 1,
          name: "IT",
          active: true,
        },
        {
          idDepartment: 2,
          name: "Human Resources",
          active: false,
        },
      ];

      mockedGet.mockResolvedValue({
        data: departments,
      });

      const result = await getAllDepartments();

      expect(mockedGet).toHaveBeenCalledWith("/departments");
      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(departments);
    });
  });

  describe("getAllActiveDepartments", () => {
    it("should return all active departments", async () => {
      const departments: DepartmentResponse[] = [
        {
          idDepartment: 1,
          name: "IT",
          active: true,
        },
      ];

      mockedGet.mockResolvedValue({
        data: departments,
      });

      const result = await getAllActiveDepartments();

      expect(mockedGet).toHaveBeenCalledWith("/departments/active");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(departments);
    });
  });

  describe("createDepartment", () => {
    it("should create department", async () => {
      const request: DepartmentRequest = {
        name: "IT",
      };

      const response: DepartmentResponse = {
        idDepartment: 1,
        name: "IT",
        active: true,
      };

      mockedPost.mockResolvedValue({
        data: response,
      });

      const result = await createDepartment(request);

      expect(mockedPost).toHaveBeenCalledWith("/departments", request);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("updateDepartment", () => {
    it("should update department", async () => {
      const request: DepartmentRequest = {
        name: "Support",
      };

      const response: DepartmentResponse = {
        idDepartment: 1,
        name: "Support",
        active: true,
      };

      mockedPut.mockResolvedValue({
        data: response,
      });

      const result = await updateDepartment(1, request);

      expect(mockedPut).toHaveBeenCalledWith("/departments/1", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("activateDepartment", () => {
    it("should activate department", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await activateDepartment(1);

      expect(mockedPatch).toHaveBeenCalledWith("/departments/1/activate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivateDepartment", () => {
    it("should deactivate department", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await deactivateDepartment(1);

      expect(mockedPatch).toHaveBeenCalledWith("/departments/1/deactivate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });
});
