import NextAuth from 'next-auth'

// Ta konfiguracja NIE importuje Prisma — bezpieczna dla Edge Runtime
export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [], // providers są w auth.node.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'person' | 'company' | 'admin'
      }
      return session
    },
  },
})
