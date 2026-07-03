import { betterAuth } from "better-auth"
import { Pool } from "pg";
import { nextCookies } from "better-auth/next-js"
import { discordActivityProvider } from "./providers/discord-activity"

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.CONNECTION_STRING as string,
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        username: profile.username as string,
      }),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        username: (profile.email as string).split("@")[0],
      }),
    },
  },
  plugins: [discordActivityProvider(), nextCookies()],
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  user: {
    modelName: "Users",
    deleteUser: {
      enabled: true,
    },
    fields: {
      name: "Name",
      email: "Email",
      emailVerified: "EmailVerified",
      image: "Image",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
    },
    additionalFields: {
      username: {
        type: "string",
        required: true,
        fieldName: "Username",
      },
    },
  },
  session: {
    modelName: "Sessions",
    fields: {
      userId: "UserId",
      token: "Token",
      expiresAt: "ExpiresAt",
      ipAddress: "IpAddress",
      userAgent: "UserAgent",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
    },
  },
  account: {
    modelName: "Accounts",
    fields: {
      userId: "UserId",
      accountId: "AccountId",
      providerId: "ProviderId",
      accessToken: "AccessToken",
      refreshToken: "RefreshToken",
      accessTokenExpiresAt: "AccessTokenExpiresAt",
      refreshTokenExpiresAt: "RefreshTokenExpiresAt",
      scope: "Scope",
      idToken: "IdToken",
      password: "Password",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
    },
  },
  verification: {
    modelName: "Verifications",
    fields: {
      identifier: "Identifier",
      value: "Value",
      expiresAt: "ExpiresAt",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
    },
  },
  trustedOrigins: ["https://*.discordsays.com"],
})
