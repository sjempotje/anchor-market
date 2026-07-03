export interface WalletDto {
  id: string
  userId: string
  balance: string
  availableBalance: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface TransactionDto {
  id: string
  walletId: string
  type: "deposit" | "withdrawal" | "trade" | "fee" | "settlement"
  amount: string
  balanceBefore: string
  balanceAfter: string
  description: string
  createdAt: string
}
