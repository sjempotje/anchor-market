"use client";

import { MarketCarousel, sampleMarkets } from "@/components/market-card";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Market Card — Component Preview
      </h1>

      <div className="lg:flex lg:flex-col gap-8">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Carousel (all markets)
          </h2>
          <div className="lg:flex lg:min-h-125">
            <MarketCarousel markets={sampleMarkets} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
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
  );
}
