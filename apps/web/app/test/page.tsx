"use client"

import { MarketCarousel, sampleMarkets } from "@/components/market-card"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Market Card, Component Preview
      </h1>

      <div className="gap-8 lg:flex lg:flex-col">
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Carousel (all markets)
          </h2>
          <div className="lg:flex lg:min-h-125">
            <MarketCarousel markets={sampleMarkets} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Individual panels
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {sampleMarkets.map((market) => (
              <div key={market.id} className="lg:flex lg:min-h-120">
                <MarketCarousel markets={[market]} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
