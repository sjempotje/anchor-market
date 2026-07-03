export interface WalletDto {
  id: string
  userId: string
  balance: string
  availableBalance: string
  currency: string
  createdAt: string
  updatedAt: string
}

// Mirrors AnchorMarket.Domain.Enums.TransactionType: 0 = Debit (funds leaving
// the wallet), 1 = Credit (funds entering the wallet). No JsonStringEnumConverter
// is configured on the API, so this comes over the wire as a plain number.
export type TransactionType = 0 | 1

export interface TransactionDto {
  id: string
  type: TransactionType
  amount: string | number
  description: string | null
  positionId: string | null
  createdAt: string
}
