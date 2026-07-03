import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getServerApiClient } from "@/lib/api/server"
import type { WalletDto, TransactionDto } from "@/lib/api/wallet"
import WalletClient from "./wallet-client"

export default async function WalletPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  let wallet: WalletDto | null = null
  let transactions: TransactionDto[] = []
  try {
    const api = await getServerApiClient()
    const [walletRes, txRes] = await Promise.all([
      api.wallets.apiWalletsUserUserIdGet(session.user.id),
      api.wallets.apiWalletsUserUserIdTransactionsGet(session.user.id),
    ])
    wallet = walletRes.data as unknown as WalletDto
    const raw = txRes.data as unknown
    if (raw && Array.isArray(raw)) {
      transactions = raw as TransactionDto[]
    }
  } catch (e) {
    console.error("Wallet page API error:", e)
  }

  return <WalletClient wallet={wallet} transactions={transactions} />
}
