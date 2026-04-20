"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import SVGLogo from "./logo"
import { Input } from "@workspace/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  IconInfoCircle,
  IconMenu2,
  IconSearch,
  IconUser,
  IconCreditCard,
  IconSettings,
  IconLogout,
  IconTrendingUp,
} from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { authClient } from "@/lib/auth-client"
import type { auth } from "@/lib/auth"

type Session = Awaited<ReturnType<typeof auth.api.getSession>>

export default function NavBarClient({ session }: { session: Session }) {
  const [searchValue, setSearchValue] = useState("")
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  return (
    <nav
      aria-label="Main"
      className="sticky inset-x-0 top-0 z-30 box-border flex w-full max-w-full flex-col overflow-hidden bg-background"
    >
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-border" />
      <div className="z-31 mx-auto flex w-full max-w-[1350px] items-center justify-between gap-4 px-4 pt-3 pb-1 md:min-h-[68px] md:pb-2 lg:px-6">
        <div className="flex h-10 shrink-0 cursor-pointer items-center">
          <a
            aria-label="Polymarket Logo"
            href="/"
            className="flex min-w-0 items-center gap-2"
          >
            <SVGLogo className="m-2 h-12 w-auto shrink-0 text-white dark:invert" />
            <h1 className="text-text truncate align-text-bottom font-heading text-xl font-bold">
              AnchorMarket
            </h1>
          </a>
        </div>
        <div className="hidden w-full items-center gap-2 lg:flex">
          <form className="relative w-full min-w-100 p-4 lg:max-w-150 lg:p-0">
            <div className="relative rounded-lg border border-border/50 bg-input/80 shadow-sm transition-colors hover:bg-input/70">
              <div className="text-text-secondary pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
                <IconSearch size={18} stroke={1.5} />
              </div>
              <Input
                type="search"
                placeholder="Search anchormarkets..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="text-text placeholder:text-text-secondary h-11 bg-transparent pl-11 focus-visible:border-transparent focus-visible:ring-0"
              />
              <kbd className="text-text-tertiary pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 lg:block">
                /
              </kbd>
            </div>
          </form>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-body-base text-button-link-text hover:text-button-link-text-hover ml-2 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-sm p-0 px-4 py-2 font-semibold whitespace-nowrap transition duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-[97%] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                <IconInfoCircle size={20} stroke={1.5} />
                <span className="whitespace-nowrap">How it works</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-lg">How it works</DialogTitle>
                <DialogDescription>
                  AnchorMarket lets you discover and track prediction markets
                  across subjects, compare live odds, and join markets in one
                  place.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                <p>
                  Use the search bar to find markets by topic, browse trending
                  or new categories, and stay updated with the latest market
                  activity.
                </p>
                <p>
                  Sign up to save favorites, manage alerts, and participate in
                  markets with real-time insights.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="min-w-0 shrink md:min-w-fit md:shrink-0">
          <div className="ml-auto flex min-w-0 items-center gap-x-2">
            <div className="flex min-w-0 items-center gap-x-2">
              <div className="flex min-w-0 items-center gap-x-1.5 md:min-w-fit">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hover:bg-button-ghost-bg-hover flex items-center gap-2 rounded-sm px-2 py-1 transition duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.user.image ?? undefined}
                            alt={session.user.name}
                          />
                          <AvatarFallback className="text-xs font-semibold">
                            {session.user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-text hidden text-sm font-semibold md:block">
                          {session.user.name}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold">
                            {session.user.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {session.user.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a
                          href="/profile"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <IconUser size={16} stroke={1.5} />
                          Profile
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href="/payment"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <IconCreditCard size={16} stroke={1.5} />
                          Payment
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href="/settings"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <IconSettings size={16} stroke={1.5} />
                          Settings
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                        onClick={handleSignOut}
                      >
                        <IconLogout size={16} stroke={1.5} />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <button className="text-body-base bg-button-ghost-bg hover:bg-button-ghost-bg-hover text-text-brand inline-flex h-9 min-w-0 shrink cursor-pointer items-center justify-center gap-2 rounded-sm px-4 py-2 font-semibold whitespace-nowrap transition duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-[97%] disabled:pointer-events-none disabled:opacity-50 md:min-w-fit md:shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                      <span className="truncate md:overflow-visible md:text-clip md:whitespace-normal">
                        Log In
                      </span>
                    </button>
                    <button className="text-body-base bg-button-primary-bg text-button-primary-text hover:bg-button-primary-bg-hover inline-flex h-9 min-w-0 shrink cursor-pointer items-center justify-center gap-2 rounded-sm px-4 py-2 font-semibold whitespace-nowrap transition duration-150 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-[97%] disabled:pointer-events-none disabled:opacity-50 md:min-w-fit md:shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                      <span className="truncate md:overflow-visible md:text-clip md:whitespace-normal">
                        Sign Up
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Hamburger Menu, not sure what I need for other features. */}
            <div className="flex items-center gap-x-2">
              <Button variant="ghost" className="h-9 px-2">
                <IconMenu2 size={18} stroke={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[1350px] min-w-0 overflow-x-auto px-4 lg:px-6">
        <div className="relative w-full">
          <div className="pointer-events-none absolute top-1 bottom-1 left-0 z-[2] w-8 bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity duration-200 md:w-16" />
          <div className="no-scrollbar flex h-12 w-full min-w-0 snap-x snap-mandatory scroll-px-3 items-center overflow-x-auto pl-0">
            <a
              className="hover:text-text text-body-base text-text inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 py-1 font-semibold tracking-[-0.005em] whitespace-nowrap ring-offset-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              href="/"
              aria-current="page"
            >
              <IconTrendingUp size={18} stroke={1.5} />
              <span>Trending</span>
            </a>
          </div>
          <div className="pointer-events-none absolute top-1 right-0 bottom-1 z-[2] w-8 bg-gradient-to-l from-background to-transparent opacity-100 transition-opacity duration-200 md:w-16" />
        </div>
      </div>
    </nav>
  )
}
