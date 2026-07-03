import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function proxy(request: NextRequest) {
  // Discord Activities load the page with ?frame_id=... injected by the Discord client, so we can use that to skip auth checks for the Discord SDK and OAuth flows which run inside the iframe before sign-in.
  if (request.nextUrl.searchParams.get("frame_id")) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session && ["/login", "/signup"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!session && !["/login", "/signup"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|manifest.json|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webmanifest$).*)",
  ],
}
