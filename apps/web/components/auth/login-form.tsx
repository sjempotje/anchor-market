"use client"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { authClient } from "@/lib/auth-client"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"

import {
  IconBrandDiscord,
  IconBrandGoogle,
  IconLoader,
  IconTerminal,
} from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleDiscordLogin() {
    await authClient.signIn.social(
      {
        provider: "discord",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onError: (ctx) => {
          setError(ctx.error.message)
          setLoading(false)
        },
      }
    )
  }

  async function handleGoogleLogin() {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onError: (ctx) => {
          setError(ctx.error.message)
          setLoading(false)
        },
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Sign in with your Discord account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border border-red-500" variant="destructive">
              <IconTerminal className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            disabled={loading}
            onClick={handleDiscordLogin}
            className="w-full"
          >
            {loading ? (
              <IconLoader className="animate-spin" stroke={2} />
            ) : (
              <>
                <IconBrandDiscord className="mr-2 h-5 w-5" />
                Login with Discord
              </>
            )}
          </Button>
          <Button
            disabled={loading}
            onClick={handleGoogleLogin}
            className="mt-4 w-full"
          >
            {loading ? (
              <IconLoader className="animate-spin" stroke={2} />
            ) : (
              <>
                <IconBrandGoogle className="mr-2 h-5 w-5" />
                Login with Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
