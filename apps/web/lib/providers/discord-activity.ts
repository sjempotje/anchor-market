import type { BetterAuthPlugin } from "better-auth"
import { APIError, createAuthEndpoint } from "better-auth/api"
import { setSessionCookie } from "better-auth/cookies"
import * as z from "zod"

/**
 * Unique identifier for the Discord activity provider.
 * This value is used as the provider ID on linked accounts.
 */
const PROVIDER_ID = "discord-activity"

/**
 * Creates a BetterAuth plugin for Discord activity authentication.
 *
 * The provider exchanges a Discord OAuth2 authorization code for an access
 * token, fetches the Discord user's identity, links or creates a local user
 * account, and creates a session cookie.
 *
 * @returns A configured BetterAuth plugin for Discord activity.
 */
export const discordActivityProvider = (): BetterAuthPlugin => {
  return {
    id: PROVIDER_ID,
    endpoints: {
      signInDiscordActivity: createAuthEndpoint(
        "/sign-in/discord-activity",
        {
          method: "POST",
          body: z.object({
            code: z.string().min(1),
          }),
        },
        async (ctx) => {
          const { code } = ctx.body

          // Exchange the Discord OAuth2 authorization code for an access token
          const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.DISCORD_CLIENT_ID!,
              client_secret: process.env.DISCORD_CLIENT_SECRET!,
              grant_type: "authorization_code",
              code,
            }),
          })

          if (!tokenRes.ok) {
            throw new APIError("BAD_REQUEST", {
              message: "Failed to exchange Discord authorization code",
            })
          }

          const tokenData = (await tokenRes.json()) as {
            access_token?: string
            refresh_token?: string
            expires_in?: number
            token_type?: string
            error?: string
          }

          if (!tokenData.access_token) {
            throw new APIError("BAD_REQUEST", {
              message:
                tokenData.error ?? "No access token returned from Discord",
            })
          }

          // Fetch the authenticated Discord user's identity using the new token.
          const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          })

          if (!userRes.ok) {
            throw new APIError("BAD_REQUEST", {
              message: "Failed to fetch Discord user identity",
            })
          }

          const discordUser = (await userRes.json()) as {
            id: string
            username: string
            global_name?: string | null
            email?: string | null
            avatar?: string | null
          }

          const accountId = discordUser.id
          const avatarUrl = discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null

          // Locate an existing Discord provider account, or prepare to create/link one.
          const existingAccount =
            await ctx.context.internalAdapter.findAccountByProviderId(
              accountId,
              PROVIDER_ID
            )

          let user

          if (existingAccount) {
            // Returning user: refresh the stored Discord credentials and load the linked user.
            user = await ctx.context.internalAdapter.findUserById(
              existingAccount.userId
            )
            if (!user) {
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message: "Associated user record not found",
              })
            }
            await ctx.context.internalAdapter.updateAccount(
              existingAccount.id,
              {
                accessToken: tokenData.access_token,
                ...(tokenData.refresh_token && {
                  refreshToken: tokenData.refresh_token,
                }),
                ...(tokenData.expires_in && {
                  accessTokenExpiresAt: new Date(
                    Date.now() + tokenData.expires_in * 1000
                  ),
                }),
              }
            )
          } else {
            // New Discord provider account. Attempt to attach it to an existing
            // user by email before creating a fresh user record.
            const accountData = {
              providerId: PROVIDER_ID,
              accountId,
              accessToken: tokenData.access_token,
              ...(tokenData.refresh_token && {
                refreshToken: tokenData.refresh_token,
              }),
              ...(tokenData.expires_in && {
                accessTokenExpiresAt: new Date(
                  Date.now() + tokenData.expires_in * 1000
                ),
              }),
            }

            if (discordUser.email) {
              const existing =
                await ctx.context.internalAdapter.findUserByEmail(
                  discordUser.email
                )

              if (existing) {
                // Existing user found by email: link the Discord account to them.
                await ctx.context.internalAdapter.linkAccount({
                  ...accountData,
                  userId: existing.user.id,
                })
                user = existing.user
              } else {
                // No matching local user: create a new OAuth user with Discord profile data.
                const { user: createdUser } =
                  await ctx.context.internalAdapter.createOAuthUser(
                    {
                      name: discordUser.global_name ?? discordUser.username,
                      email: discordUser.email,
                      image: avatarUrl,
                      emailVerified: false,
                    },
                    accountData
                  )

                if (!createdUser) {
                  throw new APIError("INTERNAL_SERVER_ERROR", {
                    message: "Failed to create user",
                  })
                }
                user = createdUser
              }
            } else {
              // Discord did not provide an email address. Create a new user with a
              // deterministic placeholder email since deduplication is not possible.
              const { user: createdUser } =
                await ctx.context.internalAdapter.createOAuthUser(
                  {
                    name: discordUser.global_name ?? discordUser.username,
                    email: `discord-activity-${discordUser.id}@discord.invalid`,
                    image: avatarUrl,
                    emailVerified: false,
                  },
                  accountData
                )

              if (!createdUser) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "Failed to create user",
                })
              }
              user = createdUser
            }
          }

          // Create a session for the authenticated user and set the session cookie.
          const session = await ctx.context.internalAdapter.createSession(
            user.id
          )
          if (!session) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to create session",
            })
          }

          await setSessionCookie(ctx, { session, user })

          return ctx.json({
            token: session.token,
            // Return the Discord access token so the frontend can complete Discord SDK authentication.
            access_token: tokenData.access_token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            },
          })
        }
      ),
    },
  }
}
