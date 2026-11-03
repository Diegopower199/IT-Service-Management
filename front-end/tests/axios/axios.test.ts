import { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api, { setupResponseInterceptor } from "@/config/axios";

// The production environment module requires variables that are not needed in unit tests.
vi.mock("@/config/env", () => ({
  API_URL_BACK_END: "http://localhost:8080/api/v1",
}));

const initialAdapter = api.defaults.adapter;
let interceptorId: number | null = null;

function createResponse(
  config: InternalAxiosRequestConfig,
  data: unknown = {},
  status = 200,
): AxiosResponse {
  return {
    config,
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {},
  };
}

function createHttpError(config: InternalAxiosRequestConfig, status: number) {
  return new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_RESPONSE",
    config,
    undefined,
    createResponse(config, { message: "Request failed" }, status),
  );
}

function useAdapter(
  handler: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>,
) {
  const adapter = vi.fn(handler);
  api.defaults.adapter = adapter;
  return adapter;
}

function registerInterceptor() {
  // AuthContext normally stores the refreshed token. We simulate that callback here.
  const onAccessTokenRefreshed = vi.fn((token: string) => {
    localStorage.setItem("token", token);
  });
  const onSessionExpired = vi.fn();

  interceptorId = setupResponseInterceptor({
    onAccessTokenRefreshed,
    onSessionExpired,
  });

  return { onAccessTokenRefreshed, onSessionExpired };
}

describe("Axios configuration", () => {
  beforeEach(() => {
    localStorage.clear();
    interceptorId = null;
  });

  afterEach(() => {
    if (interceptorId !== null) {
      api.interceptors.response.eject(interceptorId);
    }

    api.defaults.adapter = initialAdapter;
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should configure the API URL and send refresh cookies", () => {
    expect(api.defaults.baseURL).toBe("http://localhost:8080/api/v1");
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("should attach the stored bearer token to protected requests", async () => {
    localStorage.setItem("token", "access-token");
    const adapter = useAdapter(async (config) => createResponse(config));

    await api.get("/tickets");

    expect(adapter).toHaveBeenCalledTimes(1);
    expect(adapter.mock.calls[0][0].headers.get("Authorization")).toBe(
      "Bearer access-token",
    );
  });

  it.each(["/auth/login", "/auth/refresh", "/auth/logout"])(
    "should omit the bearer token for %s",
    async (url) => {
      localStorage.setItem("token", "access-token");
      const adapter = useAdapter(async (config) => createResponse(config));

      await api.post(url);

      expect(adapter.mock.calls[0][0].headers.get("Authorization")).toBeFalsy();
    },
  );

  it("should not attach Authorization if there is no stored token", async () => {
    const adapter = useAdapter(async (config) => createResponse(config));

    await api.get("/tickets");

    expect(adapter.mock.calls[0][0].headers.get("Authorization")).toBeFalsy();
  });

  it("should refresh the token and retry the original request after 401", async () => {
    localStorage.setItem("token", "expired-token");
    const { onAccessTokenRefreshed, onSessionExpired } = registerInterceptor();

    const adapter = useAdapter(async (config) => {
      if (config.url === "/auth/refresh") {
        return createResponse(config, { token: "renewed-token" });
      }

      if (config.url === "/tickets") {
        if (config.headers.get("Authorization") === "Bearer renewed-token") {
          return createResponse(config, [{ idTicket: 1 }]);
        }
        throw createHttpError(config, 401);
      }

      throw new Error(`Unexpected endpoint: ${config.url}`);
    });

    const result = await api.get("/tickets");

    expect(result.data).toEqual([{ idTicket: 1 }]);
    expect(onAccessTokenRefreshed).toHaveBeenCalledWith("renewed-token");
    expect(localStorage.getItem("token")).toBe("renewed-token");
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(
      adapter.mock.calls.filter(([config]) => config.url === "/auth/refresh"),
    ).toHaveLength(1);
    expect(
      adapter.mock.calls.filter(([config]) => config.url === "/tickets"),
    ).toHaveLength(2);
  });

  it("should share a single refresh when multiple requests fail with 401", async () => {
    localStorage.setItem("token", "expired-token");
    const { onAccessTokenRefreshed } = registerInterceptor();

    let finishRefresh!: () => void;
    const refreshGate = new Promise<void>((resolve) => {
      finishRefresh = resolve;
    });

    const adapter = useAdapter(async (config) => {
      if (config.url === "/auth/refresh") {
        await refreshGate;
        return createResponse(config, { token: "renewed-token" });
      }

      if (config.url?.startsWith("/tickets/")) {
        if (config.headers.get("Authorization") === "Bearer renewed-token") {
          return createResponse(config, { ok: true });
        }
        throw createHttpError(config, 401);
      }

      throw new Error(`Unexpected endpoint: ${config.url}`);
    });

    const firstRequest = api.get("/tickets/1");
    const secondRequest = api.get("/tickets/2");

    await vi.waitFor(() => {
      expect(
        adapter.mock.calls.filter(([config]) => config.url === "/auth/refresh"),
      ).toHaveLength(1);
      expect(
        adapter.mock.calls.filter(([config]) =>
          config.url?.startsWith("/tickets/"),
        ),
      ).toHaveLength(2);
    });

    finishRefresh();
    const responses = await Promise.all([firstRequest, secondRequest]);

    expect(responses.map((response) => response.data)).toEqual([
      { ok: true },
      { ok: true },
    ]);
    expect(onAccessTokenRefreshed).toHaveBeenCalledTimes(1);
    expect(
      adapter.mock.calls.filter(([config]) => config.url === "/auth/refresh"),
    ).toHaveLength(1);
  });

  it("should notify session expiration when refreshing fails", async () => {
    localStorage.setItem("token", "expired-token");
    const { onAccessTokenRefreshed, onSessionExpired } = registerInterceptor();

    const adapter = useAdapter(async (config) => {
      throw createHttpError(config, 401);
    });

    await expect(api.get("/tickets")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(onAccessTokenRefreshed).not.toHaveBeenCalled();
    expect(
      adapter.mock.calls.filter(([config]) => config.url === "/auth/refresh"),
    ).toHaveLength(1);
  });

  it("should not refresh for an HTTP error other than 401", async () => {
    const { onSessionExpired } = registerInterceptor();
    const adapter = useAdapter(async (config) => {
      throw createHttpError(config, 403);
    });

    await expect(api.get("/tickets")).rejects.toMatchObject({
      response: { status: 403 },
    });

    expect(adapter).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("should not refresh when an authentication endpoint returns 401", async () => {
    const { onSessionExpired } = registerInterceptor();
    const adapter = useAdapter(async (config) => {
      throw createHttpError(config, 401);
    });

    await expect(api.post("/auth/login")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(adapter).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("should not refresh endlessly if the retried request also returns 401", async () => {
    const { onAccessTokenRefreshed, onSessionExpired } = registerInterceptor();
    const adapter = useAdapter(async (config) => {
      if (config.url === "/auth/refresh") {
        return createResponse(config, { token: "renewed-token" });
      }
      throw createHttpError(config, 401);
    });

    await expect(api.get("/tickets")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(onAccessTokenRefreshed).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(
      adapter.mock.calls.filter(([config]) => config.url === "/auth/refresh"),
    ).toHaveLength(1);
    expect(
      adapter.mock.calls.filter(([config]) => config.url === "/tickets"),
    ).toHaveLength(2);
  });
});
