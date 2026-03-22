import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Oczekująca',    color: '#ca8a04' },
  viewed:   { label: 'Przejrzana',    color: '#3b82f6' },
  accepted: { label: 'Zaakceptowana', color: '#16a34a' },
  rejected: { label: 'Odrzucona',     color: '#dc2626' },
}

export default function DashboardScreen() {
  const { user } = useAuth()
  const router   = useRouter()
  const [data,       setData]       = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab,        setTab]        = useState<'applications' | 'offers'>('applications')

  async function fetchDashboard() {
    try {
      const res = await api.get('/dashboard')
      setData(res.data.data)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#ca8a04" />

  // FIRMA
  if (user?.role === 'company') {
    return (
      <View style={s.container}>
        <FlatList
          data={data?.offers ?? []}
          keyExtractor={(i: any) => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard() }} />}
          contentContainerStyle={s.list}
          ListHeaderComponent={<Text style={s.heading}>Twoje oferty</Text>}
          ListEmptyComponent={<Text style={s.empty}>Brak ofert</Text>}
          renderItem={({ item }: any) => (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/offer/${item.id}`)}>
              <View style={s.cardRow}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.badge}>{item._count?.applications ?? 0} aplik.</Text>
              </View>
              <Text style={s.cardSub}>📍 {item.city}</Text>
              <Text style={[s.status, { color: item.status === 'active' ? '#16a34a' : '#94a3b8' }]}>
                {item.status}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )
  }

  // OSOBA PRYWATNA
  const tabData = tab === 'applications' ? (data?.applications ?? []) : (data?.myOffers ?? [])

  return (
    <View style={s.container}>
      <View style={s.tabs}>
        {(['applications', 'offers'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'applications' ? 'Moje aplikacje' : 'Moje oferty'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tabData}
        keyExtractor={(i: any) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard() }} />}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>Brak danych</Text>}
        renderItem={({ item }: any) => {
          if (tab === 'applications') {
            const st = STATUS_LABELS[item.status] ?? { label: item.status, color: '#94a3b8' }
            const offerTitle = item.offer?.title ?? '—'
            const author = item.offer?.company?.companyName
              ?? (item.offer?.person ? `${item.offer.person.firstName} ${item.offer.person.lastName}` : '')
            return (
              <TouchableOpacity style={s.card} onPress={() => router.push(`/offer/${item.offerId}`)}>
                <View style={s.cardRow}>
                  <Text style={s.cardTitle} numberOfLines={1}>{offerTitle}</Text>
                  <Text style={[s.status, { color: st.color }]}>{st.label}</Text>
                </View>
                <Text style={s.cardSub}>{author}</Text>
              </TouchableOpacity>
            )
          }
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/offer/${item.id}`)}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardSub}>📍 {item.city}</Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f8fafc' },
  heading:       { fontSize: 20, fontWeight: '800', color: '#0f172a', padding: 16, paddingBottom: 8 },
  tabs:          { flexDirection: 'row', padding: 12, gap: 8 },
  tabBtn:        { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', alignItems: 'center' },
  tabBtnActive:  { borderColor: '#FACC15', backgroundColor: '#fefce8' },
  tabText:       { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#854d0e' },
  list:          { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card:          { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  cardSub:       { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  badge:         { fontSize: 12, fontWeight: '700', color: '#ca8a04', backgroundColor: '#fefce8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  status:        { fontSize: 12, fontWeight: '700', marginTop: 6 },
  empty:         { textAlign: 'center', marginTop: 60, color: '#94a3b8', fontSize: 15 },
})
