import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getServerApiClient } from "@/lib/api/server"
import { apiFetch } from "@/lib/api/client"
import type { WalletDto } from "@/lib/api/wallet"
import { normalizeCategory, type CategorySummary } from "@/lib/api/markets"
import NavBarClient from "./navbar-client"

async function getCategories(): Promise<CategorySummary[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any[]>("/api/categories")
    return raw.map(normalizeCategory)
  } catch {
    return []
  }
}

export default async function NavBar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  let wallet: WalletDto | null = null
  if (session) {
    try {
      const api = await getServerApiClient()
      const walletRes = await api.wallets.apiWalletsUserUserIdGet(session.user.id)
      wallet = walletRes.data as unknown as WalletDto
    } catch (e) {
      console.error("Wallet API error:", e)
    }
  }

  const categories = await getCategories()

  return <NavBarClient session={session} wallet={wallet} categories={categories} />
}
