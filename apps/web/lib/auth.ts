import { betterAuth } from "better-auth"
import Database from "better-sqlite3"
import { nextCookies } from "better-auth/next-js"
import { discordActivityProvider } from "./providers/discord-activity"

export const auth = betterAuth({
  database: new Database("./sqlite.db"),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [discordActivityProvider(), nextCookies()],
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    }
  },
  trustedOrigins: ["https://*.discordsays.com"],
})
