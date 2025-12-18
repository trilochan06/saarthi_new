export const API_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000";

console.log("API_URL =", import.meta.env.VITE_API_URL);

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API GET error: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API POST error: ${res.status}`);
  return res.json();
}
