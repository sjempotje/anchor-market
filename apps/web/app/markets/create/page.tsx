import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { CreateMarketForm } from "./create-market-form"

export default async function CreateMarketPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-sm font-medium text-foreground">
            Please sign in to create a market
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create a Market</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new prediction market and invite others to predict the outcome
        </p>
      </div>

      <CreateMarketForm />
    </div>
  )
}
