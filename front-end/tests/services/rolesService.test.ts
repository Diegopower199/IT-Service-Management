import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "@/config/axios";

import {
  getAllRoles,
  getRoleById,
} from "@/app/modules/roles/services/rolesService";

import type { RoleResponse } from "@/types/roleTypes";

vi.mock("@/config/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);

describe("rolesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllRoles", () => {
    it("should return all roles", async () => {
      const roles: RoleResponse[] = [
        {
          idRole: 1,
          name: "ADMIN",
        },
        {
          idRole: 2,
          name: "TECHNICIAN",
        },
        {
          idRole: 3,
          name: "USER",
        },
      ];

      mockedGet.mockResolvedValue({
        data: roles,
      });

      const result = await getAllRoles();

      expect(mockedGet).toHaveBeenCalledWith("/roles");
      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(roles);
    });
  });

  describe("getRoleById", () => {
    it("should return role by id", async () => {
      const role: RoleResponse = {
        idRole: 2,
        name: "TECHNICIAN",
      };

      mockedGet.mockResolvedValue({
        data: role,
      });

      const result = await getRoleById(2);

      expect(mockedGet).toHaveBeenCalledWith("/roles/2");

      expect(mockedGet).toHaveBeenCalledTimes(1);

      expect(result).toEqual(role);
    });
  });
});
