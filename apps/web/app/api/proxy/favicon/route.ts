import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
) {
  const domain = request.nextUrl.searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Missing domain parameter" }, { status: 400 })
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  try {
    const response = await fetch(faviconUrl)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch favicon" }, { status: 502 })
    }

    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch favicon" }, { status: 502 })
  }
}
