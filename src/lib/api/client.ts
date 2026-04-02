import { env } from "@/lib/env";

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

class ApiClient {
  constructor(private baseUrl: string) {}

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return url.toString();
  }

  private authHeaders(): Record<string, string> {
    const token = env.API_SECRET ?? "dev-local";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async get<T>(path: string, opts?: RequestOptions): Promise<T> {
    const { params, ...init } = opts ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      method: "GET",
      ...init,
      headers: { ...this.authHeaders(), ...init?.headers },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return this.unwrap<T>(await res.json());
  }

  /** Daemon wraps responses as {ok, plans: [...]} or {ok, orgs: [...]}.
   *  If the response has exactly one data key besides "ok", unwrap it. */
  private unwrap<T>(data: unknown): T {
    if (typeof data !== "object" || data === null || Array.isArray(data)) return data as T;
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => k !== "ok");
    if (keys.length === 1) return obj[keys[0]] as T;
    return data as T;
  }

  async post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    const { params, ...init } = opts ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...init,
      headers: { ...this.authHeaders(), ...init?.headers },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return this.unwrap<T>(await res.json());
  }

  async put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    const { params, ...init } = opts ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...init,
      headers: { ...this.authHeaders(), ...init?.headers },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async delete<T>(path: string, opts?: RequestOptions): Promise<T> {
    const { params, ...init } = opts ?? {};
    const res = await fetch(this.buildUrl(path, params), {
      method: "DELETE",
      ...init,
      headers: { ...this.authHeaders(), ...init?.headers },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }
}

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}: ${body.slice(0, 200)}`);
    this.name = "ApiError";
  }
}

export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}

/** Singleton for server-side use (server actions, route handlers). */
export const api = createApiClient(env.API_URL);
