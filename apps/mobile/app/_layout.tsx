import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { StatusBar } from 'expo-status-bar'

function RootLayoutNav() {
  const { user, loading } = useAuth()
  const router    = useRouter()
  const segments  = useSegments()

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === '(auth)'
    if (!user && !inAuth) router.replace('/(auth)/login')
    if (user  &&  inAuth) router.replace('/(tabs)/offers')
  }, [user, loading, segments])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
      <Stack.Screen name="offer/[id]" options={{ headerShown: true, title: 'Oferta', headerBackTitle: 'Wróć' }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </AuthProvider>
  )
}