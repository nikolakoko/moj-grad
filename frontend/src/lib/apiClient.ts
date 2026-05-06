const BASE_URL = "/api";

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API error");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const contentLength = response.headers.get("content-length");

  // Return null for empty responses (e.g. 200 OK with no body)
  if (contentLength === "0" || response.status === 204) return null;
  if (!contentType.includes("application/json")) return null;

  return response.json();
}
