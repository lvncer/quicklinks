import type { GetLinksResponse, Link } from "@/types/links";

/**
 * APIからリンク一覧を取得する (Server Component用サービス)
 */
export async function getLinks(limit: number = 50): Promise<Link[]> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    console.error("API_BASE_URL is not set");
    return [];
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      console.error("No auth token found when calling getLinks");
      return [];
    }

    const res = await fetch(`${apiBaseUrl}/api/links?limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      console.error(`API Error: ${res.status} ${res.statusText}`);
      throw new Error("Failed to fetch links");
    }

    const data: GetLinksResponse = await res.json();
    return data.links || [];
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return [];
  }
}
