import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

/** Pełny URL z sufiksem `/api`, np. https://twojadomena.pl/api */
function resolveApiUrl(): string {
  const fromEnv =
    typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_API_URL?.trim() : undefined
  if (fromEnv) {
    const base = fromEnv.replace(/\/+$/, '')
    return base.endsWith('/api') ? base : `${base}/api`
  }
  if (__DEV__) {
    return 'http://192.168.0.12:3000/api'
  }
  return 'https://UZUPELNIJ_ADRES_BACKENDU.pl/api'
}

export const API_URL = resolveApiUrl()

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
