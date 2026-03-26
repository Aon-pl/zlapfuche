import { useRouter } from 'expo-router'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'

export default function LandingScreen() {
  const router = useRouter()

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* HERO */}
      <View style={s.heroBadge}>
        <Text style={s.heroBadgeText}>⭐ Platforma pracy tymczasowej #1 w Polsce</Text>
      </View>

      <Text style={s.heroTitle}>
        Znajdź pracę.{"\n"}
        <Text style={s.heroTitleAccent}>Już dziś.</Text>
      </Text>

      <Text style={s.heroSubtitle}>
        Łączymy pracowników z pracodawcami szukającymi rąk do pracy tymczasowej.
        Szybko, konkretnie, bez zbędnych formalności.
      </Text>

      <View style={s.ctaRow}>
        <TouchableOpacity
          style={[s.ctaBtn, s.ctaPrimary]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={s.ctaPrimaryText}>Szukam pracy →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.ctaBtn, s.ctaSecondary]}
          onPress={() => router.push({ pathname: '/(auth)/register', params: { role: 'company' } })}
        >
          <Text style={s.ctaSecondaryText}>Szukam pracowników</Text>
        </TouchableOpacity>
      </View>

      {/* STATY */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>300k+</Text>
          <Text style={s.statLabel}>Aktywnych użytkowników</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>8</Text>
          <Text style={s.statLabel}>Kategorii pracy</Text>
        </View>
      </View>

      {/* KATEGORIE */}
      <View style={s.section}>
        <Text style={s.sectionTag}>KATEGORIE</Text>
        <Text style={s.sectionTitle}>Praca w każdej branży</Text>
        <View style={s.chipsWrap}>
          {[
            '📦 Magazyn',
            '🏗️ Budowlanka',
            '🍽️ Gastronomia',
            '🚛 Transport',
            '🛒 Handel',
            '⚙️ Produkcja',
            '🧹 Sprzątanie',
            '💼 Biuro',
          ].map((c) => (
            <View key={c} style={s.chip}>
              <Text style={s.chipText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* JAK TO DZIAŁA */}
      <View style={s.section}>
        <Text style={s.sectionTag}>JAK TO DZIAŁA</Text>
        <Text style={s.sectionTitle}>Proste jak 1, 2, 3</Text>
        <View style={s.stepsRow}>
          <View style={[s.stepCard, { backgroundColor: '#f97015' }] }>
            <Text style={s.stepIcon}>👷</Text>
            <Text style={[s.stepTitle, { color: '#fff' }]}>Dla pracownika</Text>
            <Text style={s.stepText}>Utwórz profil, przeglądaj oferty, aplikuj jednym kliknięciem.</Text>
          </View>
          <View style={[s.stepCard, { backgroundColor: '#1D212B' }] }>
            <Text style={s.stepIcon}>🏢</Text>
            <Text style={[s.stepTitle, { color: '#fff' }]}>Dla pracodawcy</Text>
            <Text style={s.stepText}>Dodaj ogłoszenie i wybierz najlepszych kandydatów.</Text>
          </View>
        </View>
      </View>

      {/* CTA DOLNE */}
      <View style={s.bottomCta}>
        <Text style={s.bottomCtaTitle}>Gotowy do działania?</Text>
        <Text style={s.bottomCtaText}>
          Dołącz do tysięcy pracowników i pracodawców, którzy już korzystają z naszej platformy.
        </Text>
        <TouchableOpacity
          style={[s.ctaBtn, s.ctaBottomPrimary]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={s.ctaBottomPrimaryText}>Zaloguj się</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#FCFAF8' },
  content:        { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  heroBadge:      { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
                    backgroundColor: 'rgba(249,112,21,0.12)', marginBottom: 16 },
  heroBadgeText:  { fontSize: 11, fontWeight: '700', color: '#f97015' },
  heroTitle:      { fontSize: 32, fontWeight: '900', color: '#1D212B', marginBottom: 12 },
  heroTitleAccent:{ color: '#f97015' },
  heroSubtitle:   { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  ctaRow:         { flexDirection: 'row', gap: 10, marginBottom: 24 },
  ctaBtn:         { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary:     { backgroundColor: '#f97015', elevation: 2 },
  ctaPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  ctaSecondary:   { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  ctaSecondaryText:{ color: '#374151', fontWeight: '700', fontSize: 13 },
  statsRow:       { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statBox:        { flex: 1 },
  statValue:      { fontSize: 20, fontWeight: '900', color: '#1D212B' },
  statLabel:      { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  section:        { marginBottom: 28 },
  sectionTag:     { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#f97015', marginBottom: 4 },
  sectionTitle:   { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 12 },
  chipsWrap:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#fff',
                    borderWidth: 1, borderColor: '#e5e7eb' },
  chipText:       { fontSize: 13, color: '#374151' },
  stepsRow:       { gap: 12 },
  stepCard:       { borderRadius: 16, padding: 14 },
  stepIcon:       { fontSize: 20, marginBottom: 6 },
  stepTitle:      { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  stepText:       { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  bottomCta:      { marginTop: 16, padding: 18, borderRadius: 20,
                    backgroundColor: '#f97015' },
  bottomCtaTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 6 },
  bottomCtaText:  { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  ctaBottomPrimary:{ backgroundColor: '#fff', borderRadius: 999 },
  ctaBottomPrimaryText:{ color: '#f97015', fontWeight: '800', fontSize: 14 },
})
