import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/lib/AuthContext'

export default function TabsLayout() {
  const { user } = useAuth()
  const isCompany = user?.role === 'company'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:   '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
        },
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
        headerShadowVisible: false,
      }}
    >
      {/* PRACOWNIK: Oferty + Aplikacje + Powiadomienia + Profil */}
      {!isCompany && (
        <>
          <Tabs.Screen
            name="offers"
            options={{
              title: 'Oferty',
              tabBarLabel: 'Oferty',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="briefcase-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Moje aktywności',
              tabBarLabel: 'Moje aktyw.',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Powiadomienia',
              tabBarLabel: 'Powiad.',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil',
              tabBarLabel: 'Profil',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* FIRMA: Oferty + Kandydaci (dashboard) + Profil; powiadomienia wewnątrz ofert/dash lub badge w przyszłości */}
      {isCompany && (
        <>
          <Tabs.Screen
            name="offers"
            options={{
              title: 'Moje oferty',
              tabBarLabel: 'Oferty',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="briefcase-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Kandydaci',
              tabBarLabel: 'Kandydaci',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil firmy',
              tabBarLabel: 'Profil',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="business-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
    </Tabs>
  )
}
