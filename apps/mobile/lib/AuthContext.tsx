import { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import api from '@/lib/api'

interface User {
  id:    string
  email: string
  role:  'person' | 'company'
  name:  string
}

interface AuthContextType {
  user:     User | null
  token:    string | null
  loading:  boolean
  login:    (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout:   () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  role: 'person' | 'company'
  firstName?: string
  lastName?: string
  companyName?: string
  city?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadToken() {
      try {
        const saved = await SecureStore.getItemAsync('auth_token')
        const savedUser = await SecureStore.getItemAsync('auth_user')
        if (saved && savedUser) {
          setToken(saved)
          setUser(JSON.parse(savedUser))
        }
      } catch {}
      setLoading(false)
    }
    loadToken()
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data.data
    await SecureStore.setItemAsync('auth_token', t)
    await SecureStore.setItemAsync('auth_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  async function register(data: RegisterData) {
    const res = await api.post('/auth/register', data)
    const { token: t, user: u } = res.data.data
    await SecureStore.setItemAsync('auth_token', t)
    await SecureStore.setItemAsync('auth_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  async function logout() {
    await SecureStore.deleteItemAsync('auth_token')
    await SecureStore.deleteItemAsync('auth_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
