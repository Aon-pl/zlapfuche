import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'person' | 'company' | 'admin'
    } & DefaultSession['user']
  }
}

const credentialsProvider = {
  provider: Credentials({
    credentials: {
      email:    { label: 'Email',  type: 'email'    },
      password: { label: 'Hasło',  type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      })
      if (!user) return null

      const valid = await bcrypt.compare(
        credentials.password as string,
        user.password
      )
      if (!valid) return null

      return { id: user.id, email: user.email, role: user.role }
    },
  }),
}

const googleProvider = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? {
      provider: Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    }
  : null

const facebookProvider = process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
  ? {
      provider: Facebook({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      }),
    }
  : null

const providers = [
  credentialsProvider.provider,
  ...(googleProvider ? [googleProvider.provider] : []),
  ...(facebookProvider ? [facebookProvider.provider] : []),
]

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'linkedin') {
        const email = user.email
        if (!email) return true

        let existingUser = await prisma.user.findUnique({ where: { email } })

        if (!existingUser) {
          const nameParts = user.name?.split(' ') || ['', '']
          existingUser = await prisma.user.create({
            data: {
              email,
              password: await bcrypt.hash(Math.random().toString(36).slice(-16), 12),
              role: 'person',
              emailVerified: true,
              personProfile: {
                create: {
                  firstName: nameParts[0] || 'Użytkownik',
                  lastName: nameParts.slice(1).join(' ') || '',
                },
              },
            },
          })
        }

        user.id = existingUser.id
        ;(user as any).role = existingUser.role
      }
      return true
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id   = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id   = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
