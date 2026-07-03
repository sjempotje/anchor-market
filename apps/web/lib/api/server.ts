import { cookies } from "next/headers"
import { createApiClient } from "./client"

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return (
    cookieStore.get("__Secure-better-auth.session_token")?.value ??
    cookieStore.get("better-auth.session_token")?.value ??
    undefined
  )
}

export async function getServerApiClient() {
  const token = await getSessionToken()
  return createApiClient(token)
}
