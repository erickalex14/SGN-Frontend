const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

/** JSON client for the Laravel API. Keep business rules and authorization in Laravel. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...init.headers },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}