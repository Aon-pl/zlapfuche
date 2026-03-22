import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/lib/AuthContext'

export default function TabsLayout() {
  const { user } = useAuth()

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor:   '#ca8a04',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: { borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
      headerStyle: { backgroundColor: '#fff' },
      headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
      headerShadowVisible: false,
    }}>
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Oferty',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Powiadomienia',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
