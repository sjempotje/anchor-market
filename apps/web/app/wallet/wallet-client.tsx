"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight,
  IconRefresh,
  IconPlus,
  IconSend,
} from "@tabler/icons-react"
import type { WalletDto, TransactionDto } from "@/lib/api/wallet"

function TransactionIcon({ type }: { type: TransactionDto["type"] }) {
  return type === 1 ? (
    <IconArrowUpRight size={18} stroke={1.5} className="text-emerald-500" />
  ) : (
    <IconArrowDownRight size={18} stroke={1.5} className="text-red-500" />
  )
}

function TransactionAmount({ tx }: { tx: TransactionDto }) {
  const amount = Number.parseFloat(String(tx.amount))
  const isCredit = tx.type === 1
  const color = isCredit ? "text-emerald-500" : "text-red-500"
  const prefix = isCredit ? "+" : "-"

  return (
    <span className={`font-medium tabular-nums ${color}`}>
      {prefix}{Math.abs(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  )
}

function formatTxDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function typeLabel(type: TransactionDto["type"]): string {
  return type === 1 ? "Credit" : "Debit"
}

export default function WalletClient({
  wallet,
  transactions,
}: {
  wallet: WalletDto | null
  transactions: TransactionDto[]
}) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    router.refresh()
    setRefreshing(false)
  }

  const balance = wallet ? Number.parseFloat(wallet.balance) : 0
  const available = wallet ? Number.parseFloat(wallet.availableBalance) : 0
  const currency = wallet?.currency ?? "USDC"

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-8 text-center shadow-sm sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-border ring-offset-2 ring-offset-background">
          <IconWallet size={32} stroke={1.5} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-foreground">
            Wallet
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your funds and view transactions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <IconRefresh size={16} stroke={1.5} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconWallet size={18} stroke={1.5} />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">
              {balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{currency}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconArrowDownRight size={18} stroke={1.5} />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">
              {available.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{currency}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 gap-2">
          <IconPlus size={16} stroke={1.5} />
          Deposit
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <IconSend size={16} stroke={1.5} />
          Withdraw
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconArrowUpRight size={18} stroke={1.5} />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your latest wallet activity will appear here.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {!wallet ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <IconWallet
                size={40}
                stroke={1.5}
                className="text-muted-foreground/40"
              />
              <p className="text-sm text-muted-foreground">
                No wallet found. Get started by making your first deposit.
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <IconRefresh
                size={40}
                stroke={1.5}
                className="text-muted-foreground/40"
              />
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <TransactionIcon type={tx.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.description || typeLabel(tx.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTxDate(tx.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <TransactionAmount tx={tx} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
