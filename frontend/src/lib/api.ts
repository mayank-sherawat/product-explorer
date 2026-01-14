const API = 'http://localhost:3001'

if (!API) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  return res.json();
}
