import { Geist, Geist_Mono, Noto_Serif } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import DefaultContainerLayout from "@/components/layouts/default"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import NavBar from "@/components/navbar"
import DiscordActivityGate from "@/components/discord-activity-gate"
import { Metadata } from "next"


const notoSerifHeading = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-heading",
})

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})


export const metadata: Metadata = {
  title: "Anchor Market",
  description: "It's a simple progressive web application made with NextJS",
  generator: "Next.js",
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
  },
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        notoSerifHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <DiscordActivityGate>
              <NavBar />
              <DefaultContainerLayout>{children}</DefaultContainerLayout>
            </DiscordActivityGate>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
