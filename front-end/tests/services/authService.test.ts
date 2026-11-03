import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import { login, logout } from "@/app/modules/auth/services/authService";

import type { AuthResponse, LoginRequest } from "@/types/authTypes";

vi.mock("@/config/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(api.post);

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login user and return authentication data", async () => {
      const loginRequest: LoginRequest = {
        username: "john",
        password: "password123",
      };

      const authResponse: AuthResponse = {
        token: "access-token",
        userId: 1,
        username: "john",
        role: "USER",
      };

      mockedPost.mockResolvedValue({
        data: authResponse,
      });

      const result = await login(loginRequest);

      expect(mockedPost).toHaveBeenCalledWith("/auth/login", loginRequest);

      expect(mockedPost).toHaveBeenCalledTimes(1);

      expect(result).toEqual(authResponse);
    });
  });

  describe("logout", () => {
    it("should logout current user", async () => {
      mockedPost.mockResolvedValue({
        data: undefined,
      });

      await logout();

      expect(mockedPost).toHaveBeenCalledWith("/auth/logout");

      expect(mockedPost).toHaveBeenCalledTimes(1);
    });
  });
});
