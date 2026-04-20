import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import NavBarClient from "./navbar-client"

export default async function NavBar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return <NavBarClient session={session} />
}
