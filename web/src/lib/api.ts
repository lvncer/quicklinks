// 型定義
export interface Link {
  id: string;
  url: string;
  title: string;
  domain: string;
  page_url: string;
  note: string;
  user_identifier: string;
  saved_at: string; // APIからはISO文字列で返ってくる
}

export interface GetLinksResponse {
  links: Link[];
}

/**
 * APIからリンク一覧を取得する (Server Component用)
 */
export async function getLinks(limit: number = 50): Promise<Link[]> {
  const apiBaseUrl = process.env.API_BASE_URL;
  const sharedSecret = process.env.SHARED_SECRET;

  if (!apiBaseUrl || !sharedSecret) {
    console.error("API_BASE_URL or SHARED_SECRET is not set");
    return [];
  }

  try {
    const res = await fetch(`${apiBaseUrl}/api/links?limit=${limit}`, {
      method: "GET",
      headers: {
        "X-QuickLink-Secret": sharedSecret,
        "Content-Type": "application/json",
      },
      // ISR: 60秒キャッシュ (または cache: 'no-store' で毎回取得)
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
