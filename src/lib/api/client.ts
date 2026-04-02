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
    return res.json();
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
    return res.json();
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
