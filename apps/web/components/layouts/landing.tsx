import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card"

export default function LandingSection() {
  return (
    <div className="mt-6 flex max-h-3/5 min-h-3/5 w-full flex-col">
      <div className="flex flex-1 justify-center gap-6 bg-red-600">
        {/* Left: 3.75 (5 parts) */}
        <div className="flex-5 bg-blue-500">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>
                This is a description of the card.{" "}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Fugiat id Lorem quis minim et ad veniam. Velit tempor nostrud
                occaecat nisi irure in velit magna consequat dolore. Nostrud
                labore qui incididunt ea eu amet laborum. Laborum proident ut
                Lorem reprehenderit laborum sunt dolor nisi sit enim officia
                dolore occaecat. Aliqua culpa aute cillum irure duis deserunt
                eiusmod esse pariatur. Non consectetur nisi ad excepteur
                pariatur eiusmod exercitation in sint velit esse.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-2 flex-col">
          <div className="flex-1 bg-blue-800"></div>
          <div className="flex-1 bg-blue-600"></div>
        </div>
      </div>

      <div className="flex h-12 w-full">
        <div className="flex-1 bg-green-400" />
        <div className="flex-1 bg-green-800" />
      </div>
    </div>
  )
}
