import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMarketDetail } from "@/lib/api/market-detail"
import MarketDetailClient from "@/components/market-detail/market-detail-client"

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let detail
  try {
    detail = await getMarketDetail(id)
  } catch (e) {
    console.error("Market detail API error:", e)
    detail = null
  }

  if (!detail) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id ?? null

  // The creator assigns a specific resolver at market-creation time, only that
  // person can resolve it, not "any member other than the creator".
  const canResolve = !!userId && detail.market.assignedResolverId === userId

  return <MarketDetailClient detail={detail} canResolve={canResolve} />
}
