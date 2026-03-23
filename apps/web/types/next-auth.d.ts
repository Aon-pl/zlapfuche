import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'person' | 'company' | 'admin'
    } & DefaultSession['user']
  }

  interface User {
  role: 'person' | 'company' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'person' | 'company' | 'admin'
  }
}
