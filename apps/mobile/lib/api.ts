import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

// Zmień na URL swojego serwera po wdrożeniu
export const API_URL = __DEV__
 ? 'http://192.168.0.12:3000/api'  // ← zmień na IP swojego komputera podczas dev
  : 'https://twojadomena.lh.pl/api'  // ← zmień na domenę serwera produkcyjnego

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Automatycznie dodaj token do każdego żądania
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
