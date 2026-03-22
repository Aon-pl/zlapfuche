import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import api from '@/lib/api'

const CATEGORIES = [
  { value: '',             label: 'Wszystkie' },
  { value: 'warehouse',    label: '📦 Magazyn' },
  { value: 'construction', label: '🏗️ Budowlanka' },
  { value: 'hospitality',  label: '🍽️ Gastronomia' },
  { value: 'transport',    label: '🚛 Transport' },
  { value: 'manufacturing',label: '⚙️ Produkcja' },
  { value: 'retail',       label: '🛒 Handel' },
  { value: 'office',       label: '💼 Biuro' },
  { value: 'other',        label: '🔧 Inne' },
]

const SALARY_TYPES: Record<string, string> = {
  hourly: 'h', daily: 'dzień', monthly: 'mies.'
}

interface Offer {
  id: string
  title: string
  category: string
  city: string
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string
  remote: boolean
  createdAt: string
  applicationsCount: number
  company?: { companyName: string } | null
  person?:  { firstName: string; lastName: string } | null
}

export default function OffersScreen() {
  const router = useRouter()
  const [offers,    setOffers]    = useState<Offer[]>([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)
  const [search,    setSearch]    = useState('')
  const [category,  setCategory]  = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)

  async function fetchOffers(reset = false) {
    try {
      const p = reset ? 1 : page
      const res = await api.get('/offers', { params: { search, category, page: p } })
      const { offers: data, total: t } = res.data.data
      setOffers(reset ? data : prev => [...prev, ...data])
      setTotal(t)
      if (!reset) setPage(p + 1)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchOffers(true) }, [search, category])

  function onRefresh() { setRefreshing(true); setPage(1); fetchOffers(true) }

  function renderOffer({ item }: { item: Offer }) {
    const author = item.company?.companyName
      ?? (item.person ? `${item.person.firstName} ${item.person.lastName}` : '')
    const salary = item.salaryMin
      ? `${item.salaryMin}${item.salaryMax ? `–${item.salaryMax}` : '+'} zł/${SALARY_TYPES[item.salaryType] ?? 'h'}`
      : null

    return (
      <TouchableOpacity style={s.card} onPress={() => router.push(`/offer/${item.id}`)}>
        <View style={s.cardRow}>
          <View style={s.cardMain}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={s.cardSub} numberOfLines={1}>{author} · 📍 {item.city}</Text>
          </View>
          {salary && <Text style={s.salary}>{salary}</Text>}
        </View>
        <View style={s.cardFooter}>
          <Text style={s.tag}>{item.category}</Text>
          {item.remote && <Text style={s.tagBlue}>Zdalna</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={s.container}>

      {/* Wyszukiwarka */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Szukaj ofert..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={t => { setSearch(t); setPage(1) }}
        />
      </View>

      {/* Kategorie */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.catBtn, category === item.value && s.catBtnActive]}
            onPress={() => { setCategory(item.value); setPage(1) }}
          >
            <Text style={[s.catText, category === item.value && s.catTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Lista */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#ca8a04" />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={i => i.id}
          renderItem={renderOffer}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => { if (offers.length < total) fetchOffers() }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={s.empty}>Brak ofert</Text>}
          ListFooterComponent={offers.length < total ? <ActivityIndicator color="#ca8a04" style={{ marginVertical: 16 }} /> : null}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc' },
  searchRow:    { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInput:  { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#0f172a' },
  catList:      { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  catBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  catBtnActive: { borderColor: '#FACC15', backgroundColor: '#fefce8' },
  catText:      { fontSize: 13, color: '#64748b' },
  catTextActive:{ color: '#854d0e', fontWeight: '700' },
  list:         { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardMain:     { flex: 1, marginRight: 8 },
  cardTitle:    { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  cardSub:      { fontSize: 12, color: '#94a3b8' },
  salary:       { fontSize: 14, fontWeight: '800', color: '#ca8a04' },
  cardFooter:   { flexDirection: 'row', gap: 6, marginTop: 10 },
  tag:          { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#f1f5f9', borderRadius: 6, color: '#64748b' },
  tagBlue:      { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#eff6ff', borderRadius: 6, color: '#3b82f6' },
  empty:        { textAlign: 'center', marginTop: 60, color: '#94a3b8', fontSize: 15 },
})
