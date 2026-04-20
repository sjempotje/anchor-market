import { betterAuth } from "better-auth"
import Database from "better-sqlite3"
import { nextCookies } from "better-auth/next-js"

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
  plugins: [nextCookies()],
})
