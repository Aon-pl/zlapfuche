import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '@/lib/api'
import { colors } from '@/lib/ui/theme'

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string }
  const router = useRouter()
  const [offer, setOffer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await api.get(`/offers/${id}`)
        if (!mounted) return
        setOffer(res.data.data.offer)
      } catch (e) {
        console.warn('offer fetch err', e)
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
  if (!offer) return <Text style={s.empty}>Nie znaleziono oferty</Text>

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>{offer.title}</Text>
      <Text style={s.company}>{offer.company?.companyName ?? `${offer.person?.firstName} ${offer.person?.lastName}`}</Text>

      <View style={s.metaRow}>
        <Text style={s.meta}>{offer.city}</Text>
        {offer.remote && <Text style={s.remote}>Zdalna</Text>}
        <Text style={s.meta}>{new Date(offer.createdAt).toLocaleDateString()}</Text>
      </View>

      {offer.salaryMin && (
        <View style={s.salaryBox}>
          <Text style={s.salaryLabel}>Wynagrodzenie</Text>
          <Text style={s.salaryValue}>{offer.salaryMin}{offer.salaryMax ? `–${offer.salaryMax}` : ''} zł/{offer.salaryType}</Text>
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionTitle}>Opis</Text>
        <Text style={s.sectionText}>{offer.description}</Text>
      </View>

      <TouchableOpacity style={s.applyBtn} onPress={() => {/* TODO: aplikuj */}}>
        <Text style={s.applyText}>Aplikuj teraz</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 6 },
  company: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 },
  meta: { fontSize: 12, color: colors.muted },
  remote: { fontSize: 12, color: '#3b82f6', backgroundColor: colors.tagBlueBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  salaryBox: { backgroundColor: colors.surface, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  salaryLabel: { fontSize: 12, color: colors.muted },
  salaryValue: { fontSize: 16, fontWeight: '800', color: colors.accent },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 6 },
  sectionText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  applyBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 8 },
  applyText: { color: '#fff', fontWeight: '800' },
  empty: { textAlign: 'center', marginTop: 40, color: colors.muted }
})
