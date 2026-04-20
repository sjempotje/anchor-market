import { createAuthClient } from "better-auth/react"

const authBaseURL = typeof window !== "undefined" ? window.location.origin : ""

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [],
})
