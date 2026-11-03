import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getAllActiveCategories,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "@/app/modules/categories/services/categoryService";

import type { CategoryRequest, CategoryResponse } from "@/types/categoryTypes";

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

describe("categoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllCategories", () => {
    it("should return all categories", async () => {
      const categories: CategoryResponse[] = [
        {
          idCategory: 1,
          name: "Hardware",
          active: true,
        },
        {
          idCategory: 2,
          name: "Software",
          active: false,
        },
      ];

      mockedGet.mockResolvedValue({
        data: categories,
      });

      const result = await getAllCategories();

      expect(mockedGet).toHaveBeenCalledWith("/categories");
      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(categories);
    });
  });

  describe("getAllActiveCategories", () => {
    it("should return all active categories", async () => {
      const categories: CategoryResponse[] = [
        {
          idCategory: 1,
          name: "Hardware",
          active: true,
        },
      ];

      mockedGet.mockResolvedValue({
        data: categories,
      });

      const result = await getAllActiveCategories();

      expect(mockedGet).toHaveBeenCalledWith("/categories/active");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(categories);
    });
  });

  describe("getCategoryById", () => {
    it("should return category by id", async () => {
      const category: CategoryResponse = {
        idCategory: 1,
        name: "Hardware",
        active: true,
      };

      mockedGet.mockResolvedValue({
        data: category,
      });

      const result = await getCategoryById(1);

      expect(mockedGet).toHaveBeenCalledWith("/categories/1");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(category);
    });
  });

  describe("createCategory", () => {
    it("should create category", async () => {
      const request: CategoryRequest = {
        name: "Hardware",
      };

      const response: CategoryResponse = {
        idCategory: 1,
        name: "Hardware",
        active: true,
      };

      mockedPost.mockResolvedValue({
        data: response,
      });

      const result = await createCategory(request);

      expect(mockedPost).toHaveBeenCalledWith("/categories", request);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("updateCategory", () => {
    it("should update category", async () => {
      const request: CategoryRequest = {
        name: "Updated Hardware",
      };

      const response: CategoryResponse = {
        idCategory: 1,
        name: "Updated Hardware",
        active: true,
      };

      mockedPut.mockResolvedValue({
        data: response,
      });

      const result = await updateCategory(1, request);

      expect(mockedPut).toHaveBeenCalledWith("/categories/1", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("activateCategory", () => {
    it("should activate category", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await activateCategory(1);

      expect(mockedPatch).toHaveBeenCalledWith("/categories/1/activate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivateCategory", () => {
    it("should deactivate category", async () => {
      mockedPatch.mockResolvedValue({
        data: undefined,
      });

      await deactivateCategory(1);

      expect(mockedPatch).toHaveBeenCalledWith("/categories/1/deactivate");

      expect(mockedPatch).toHaveBeenCalledTimes(1);
    });
  });
});
