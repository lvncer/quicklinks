import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiBaseUrl = process.env.API_BASE_URL;
  const sharedSecret = process.env.SHARED_SECRET;

  if (!apiBaseUrl || !sharedSecret) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${apiBaseUrl}/api/og?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
        headers: {
          "X-QuickLink-Secret": sharedSecret,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `API Error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata from API" },
      { status: 500 }
    );
  }
}
