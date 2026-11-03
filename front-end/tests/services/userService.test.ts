import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  changePassword,
  createUser,
  getAllTechnicians,
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateCurrentUser,
  updateUser,
} from "@/app/modules/users/services/userService";

import type {
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateProfileRequest,
  UpdateUserRequest,
  UserResponse,
  UserSummaryResponse,
} from "@/types/userTypes";

import type { PageResponse } from "@/types/paginationTypes";

vi.mock("@/config/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
const mockedPut = vi.mocked(api.put);

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user: UserResponse = {
    idUser: 1,
    username: "john",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    enabled: true,

    role: {
      idRole: 3,
      name: "USER",
    },

    department: {
      idDepartment: 1,
      name: "IT",
      active: true,
    },
  };

  describe("getAllUsers", () => {
    it("should return paginated users", async () => {
      const response: PageResponse<UserResponse> = {
        content: [user],

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

      const result = await getAllUsers(0, 10, "username,asc");

      expect(mockedGet).toHaveBeenCalledWith("/users", {
        params: {
          page: 0,
          size: 10,
          sort: "username,asc",
        },
      });

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(response);
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      mockedGet.mockResolvedValue({
        data: user,
      });

      const result = await getUserById(1);

      expect(mockedGet).toHaveBeenCalledWith("/users/1");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(user);
    });
  });

  describe("getCurrentUser", () => {
    it("should return current authenticated user", async () => {
      mockedGet.mockResolvedValue({
        data: user,
      });

      const result = await getCurrentUser();

      expect(mockedGet).toHaveBeenCalledWith("/users/me");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(user);
    });
  });

  describe("getAllTechnicians", () => {
    it("should return all technicians", async () => {
      const technicians: UserSummaryResponse[] = [
        {
          idUser: 2,
          username: "tech1",
        },
        {
          idUser: 3,
          username: "tech2",
        },
      ];

      mockedGet.mockResolvedValue({
        data: technicians,
      });

      const result = await getAllTechnicians();

      expect(mockedGet).toHaveBeenCalledWith("/users/technicians");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(technicians);
    });
  });

  describe("createUser", () => {
    it("should create user", async () => {
      const request: CreateUserRequest = {
        username: "john",
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        roleId: 3,
        departmentId: 1,
        enabled: true,
      };

      mockedPost.mockResolvedValue({
        data: user,
      });

      const result = await createUser(request);

      expect(mockedPost).toHaveBeenCalledWith("/users", request);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(user);
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      const request: UpdateUserRequest = {
        username: "john",
        email: "john.updated@example.com",
        firstName: "Johnny",
        lastName: "Doe",
        roleId: 2,
        departmentId: 2,
        enabled: true,
      };

      const updatedUser: UserResponse = {
        ...user,
        email: "john.updated@example.com",
        firstName: "Johnny",

        role: {
          idRole: 2,
          name: "TECHNICIAN",
        },

        department: {
          idDepartment: 2,
          name: "Support",
          active: true,
        },
      };

      mockedPut.mockResolvedValue({
        data: updatedUser,
      });

      const result = await updateUser(1, request);

      expect(mockedPut).toHaveBeenCalledWith("/users/1", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);

      expect(result).toEqual(updatedUser);
    });
  });

  describe("updateCurrentUser", () => {
    it("should update current user profile", async () => {
      const request: UpdateProfileRequest = {
        email: "new@example.com",
        firstName: "Johnny",
        lastName: "Doe",
      };

      const updatedUser: UserResponse = {
        ...user,
        email: "new@example.com",
        firstName: "Johnny",
      };

      mockedPut.mockResolvedValue({
        data: updatedUser,
      });

      const result = await updateCurrentUser(request);

      expect(mockedPut).toHaveBeenCalledWith("/users/me", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);

      expect(result).toEqual(updatedUser);
    });
  });

  describe("changePassword", () => {
    it("should change current user password", async () => {
      const request: ChangePasswordRequest = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword123",
      };

      mockedPut.mockResolvedValue({
        data: undefined,
      });

      await changePassword(request);

      expect(mockedPut).toHaveBeenCalledWith("/users/change-password", request);

      expect(mockedPut).toHaveBeenCalledTimes(1);
    });
  });
});
