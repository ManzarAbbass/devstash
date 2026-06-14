import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimiters, getIP, checkRateLimit } from "@/lib/rate-limit"
import authConfig from "./auth.config"

class RateLimitError extends CredentialsSignin {
  code = "rate_limit"
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const ip = getIP(request!)
        const identifier = `${ip}:${email}`
        const { success } = await checkRateLimit(rateLimiters.login, identifier)
        if (!success) throw new RateLimitError()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        const emailVerificationEnabled = process.env.EMAIL_VERIFICATION !== "false"
        if (emailVerificationEnabled && !user.emailVerified) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
