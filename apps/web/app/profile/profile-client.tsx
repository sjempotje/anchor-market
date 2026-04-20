"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import type { auth } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import {
  IconBrandDiscord,
  IconLogout,
  IconUser,
  IconShieldCheck,
  IconCalendar,
  IconMail,
} from "@tabler/icons-react"

type Session = Awaited<ReturnType<typeof auth.api.getSession>>

export default function ProfileClient({
  session,
}: {
  session: NonNullable<Session>
}) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const { user } = session

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?"

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  async function handleSignOut() {
    setSigningOut(true)

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
            router.refresh()
          },
          onError: () => {
            setSigningOut(false)
          },
        },
      })
    } catch (error) {
      console.error("Sign out failed", error)
      setSigningOut(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-8 text-center shadow-sm sm:flex-row sm:text-left">
        <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border ring-offset-2 ring-offset-background">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-foreground">
            {user.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {user.emailVerified && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <IconShieldCheck size={12} />
                Verified
              </Badge>
            )}
            <Badge variant="outline" className="gap-1 text-xs">
              <IconBrandDiscord size={12} />
              Discord
            </Badge>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <IconLogout size={16} stroke={1.5} />
              Sign out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of your account and redirected to the
                home page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconUser size={18} stroke={1.5} />
            Account Information
          </CardTitle>
          <CardDescription>
            Your personal details from your connected account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-1.5">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              Display Name
            </Label>
            <Input
              readOnly
              value={user.name ?? ""}
              className="cursor-default bg-muted/50"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
              <IconMail size={12} />
              Email Address
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={user.email ?? ""}
                className="cursor-default bg-muted/50"
              />
              {user.emailVerified && (
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <IconShieldCheck size={12} />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
              <IconCalendar size={12} />
              Member Since
            </Label>
            <Input
              readOnly
              value={joinedDate}
              className="cursor-default bg-muted/50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconBrandDiscord size={18} stroke={1.5} />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            External accounts linked to your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5865F2]/15 text-[#5865F2]">
                <IconBrandDiscord size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">Discord</p>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1 text-xs">
              <IconShieldCheck size={12} />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
