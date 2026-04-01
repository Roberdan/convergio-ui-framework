import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for server actions: safeAction wrapper and updateProfile.
 *
 * Validates error handling, Zod validation, and API interaction.
 * The API client is mocked to avoid real network calls.
 */

vi.mock("@/lib/api", () => ({
  api: {
    put: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    body: string;
    constructor(status: number, body: string) {
      super(`API ${status}: ${body}`);
      this.name = "ApiError";
      this.status = status;
      this.body = body;
    }
  },
}));

describe("safeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success result for resolved promise", async () => {
    const { safeAction } = await import("./profile");
    const result = await safeAction(async () => 42);

    expect(result).toEqual({ success: true, data: 42 });
  });

  it("returns error result for rejected promise", async () => {
    const { safeAction } = await import("./profile");
    const result = await safeAction(async () => {
      throw new Error("Connection refused");
    });

    expect(result).toEqual({
      success: false,
      error: "Connection refused",
    });
  });

  it("handles non-Error thrown values", async () => {
    const { safeAction } = await import("./profile");
    const result = await safeAction(async () => {
      throw "raw string error";
    });

    expect(result).toEqual({
      success: false,
      error: "Unknown error",
    });
  });
});

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error for empty name", async () => {
    const { updateProfile } = await import("./profile");
    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "roberto@example.com");

    const result = await updateProfile(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Name is required");
    }
  });

  it("returns validation error for invalid email", async () => {
    const { updateProfile } = await import("./profile");
    const formData = new FormData();
    formData.set("name", "Roberto D'Angelo");
    formData.set("email", "not-an-email");

    const result = await updateProfile(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid email");
    }
  });

  it("calls API and returns success for valid input", async () => {
    const apiModule = await import("@/lib/api");
    vi.mocked(apiModule.api.put).mockResolvedValueOnce(undefined);

    const { updateProfile } = await import("./profile");
    const formData = new FormData();
    formData.set("name", "Roberto D'Angelo");
    formData.set("email", "roberto@example.com");

    const result = await updateProfile(null, formData);

    expect(result.success).toBe(true);
    expect(apiModule.api.put).toHaveBeenCalledWith("/api/profile", {
      name: "Roberto D'Angelo",
      email: "roberto@example.com",
    });
  });

  it("returns success even when backend is unavailable", async () => {
    const apiModule = await import("@/lib/api");
    vi.mocked(apiModule.api.put).mockRejectedValueOnce(
      new TypeError("fetch failed"),
    );

    const { updateProfile } = await import("./profile");
    const formData = new FormData();
    formData.set("name", "Elena Marchetti");
    formData.set("email", "elena@example.org");

    const result = await updateProfile(null, formData);

    // Backend unavailable is handled gracefully (starter mode)
    expect(result.success).toBe(true);
  });

  it("returns error when API responds with ApiError", async () => {
    const apiModule = await import("@/lib/api");
    const apiError = new apiModule.ApiError(409, "Email already in use");
    vi.mocked(apiModule.api.put).mockRejectedValueOnce(apiError);

    const { updateProfile } = await import("./profile");
    const formData = new FormData();
    formData.set("name", "Marco Bianchi");
    formData.set("email", "marco@example.com");

    const result = await updateProfile(null, formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("409");
    }
  });
});
