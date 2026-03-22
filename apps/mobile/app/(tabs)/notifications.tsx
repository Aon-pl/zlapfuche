import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import api from '@/lib/api'

const TYPE_ICONS: Record<string, string> = {
  new_application: '📩',
  status_change:   '🔄',
  offer_expiring:  '⏰',
  new_offer:       '🆕',
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'przed chwilą'
  if (mins  < 60) return `${mins} min temu`
  if (hours < 24) return `${hours}h temu`
  return `${days}d temu`
}

export default function NotificationsScreen() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [refreshing,    setRefreshing]    = useState(false)

  async function fetch() {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data.notifications)
      setUnread(res.data.data.unreadCount)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetch() }, [])

  async function markAllRead() {
    await api.patch('/notifications', { markAll: true })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  async function markRead(id: string) {
    await api.patch('/notifications', { id })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  function getLink(n: any): string | null {
    if (!n.data) return null
    try {
      const d = JSON.parse(n.data)
      if (d.offerId) return `/offer/${d.offerId}`
    } catch {}
    return null
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#ca8a04" />

  return (
    <View style={s.container}>
      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch() }} />}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={s.header}>
            <Text style={s.heading}>Powiadomienia {unread > 0 && `(${unread})`}</Text>
            {unread > 0 && (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={s.markAll}>Oznacz wszystkie</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={<Text style={s.empty}>Brak powiadomień</Text>}
        renderItem={({ item }) => {
          const link = getLink(item)
          return (
            <TouchableOpacity
              style={[s.card, !item.read && s.cardUnread]}
              onPress={() => {
                if (!item.read) markRead(item.id)
                if (link) router.push(link as any)
              }}
            >
              <View style={s.cardRow}>
                <Text style={s.icon}>{TYPE_ICONS[item.type] ?? '🔔'}</Text>
                <View style={s.cardContent}>
                  <Text style={[s.cardTitle, !item.read && s.cardTitleUnread]}>{item.title}</Text>
                  <Text style={s.cardMsg} numberOfLines={2}>{item.message}</Text>
                  <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={s.dot} />}
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f8fafc' },
  list:           { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  heading:        { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  markAll:        { fontSize: 13, color: '#ca8a04', fontWeight: '600' },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardUnread:     { borderColor: '#fde68a', backgroundColor: '#fefce8' },
  cardRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon:           { fontSize: 22, marginTop: 2 },
  cardContent:    { flex: 1 },
  cardTitle:      { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 2 },
  cardTitleUnread:{ color: '#0f172a', fontWeight: '700' },
  cardMsg:        { fontSize: 13, color: '#64748b', lineHeight: 18 },
  time:           { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  dot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FACC15', marginTop: 4 },
  empty:          { textAlign: 'center', marginTop: 60, color: '#94a3b8', fontSize: 15 },
})
