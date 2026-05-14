import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card"
import { MarketCarousel, sampleMarkets } from "../market-card"

export default function LandingSection() {
  return (
    <div className="flex max-h-3/5 min-h-3/5 w-full flex-col">
      <MarketCarousel markets={sampleMarkets} />

    </div>
  )
}
