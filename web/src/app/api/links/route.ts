import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Get auth token from Clerk
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get limit from query params
  const searchParams = req.nextUrl.searchParams;
  const limit = searchParams.get("limit") || "50";

  try {
    const res = await fetch(`${apiBaseUrl}/api/links?limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Disable cache to ensure fresh data for SWR
      cache: "no-store",
    });

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
      { error: "Failed to fetch from API" },
      { status: 500 }
    );
  }
}
