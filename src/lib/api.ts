import { getAccessToken } from "@/lib/session";

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; title?: string } | null;
    throw new ApiError(response.status, payload?.error ?? payload?.title ?? `API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function apiDownload(path: string): Promise<{ blob: Blob; fileName: string | null }> {
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  const token = getAccessToken();
  const response = await fetch(`${apiUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; title?: string } | null;
    throw new ApiError(response.status, payload?.error ?? payload?.title ?? `API request failed (${response.status})`);
  }

  const disposition = response.headers.get("Content-Disposition");
  const encodedName = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
  return {
    blob: await response.blob(),
    fileName: encodedName ? decodeURIComponent(encodedName) : plainName ?? null,
  };
}
