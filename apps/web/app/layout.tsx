import { Geist, Geist_Mono, Noto_Serif } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import DefaultContainerLayout from "@/components/layouts/default"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import NavBar from "@/components/navbar"

const notoSerifHeading = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-heading",
})

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
            <NavBar />
            <DefaultContainerLayout>{children}</DefaultContainerLayout>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
