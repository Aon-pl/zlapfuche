import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { useAuth } from '@/lib/AuthContext'
import api from '@/lib/api'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState<Record<string, string>>({})

  useEffect(() => {
    api.get('/profile')
      .then(r => {
        const p = r.data.data
        setProfile(p)
        if (p.personProfile) {
          setForm({
            firstName:       p.personProfile.firstName ?? '',
            lastName:        p.personProfile.lastName  ?? '',
            city:            p.personProfile.city      ?? '',
            bio:             p.personProfile.bio       ?? '',
            experienceYears: String(p.personProfile.experienceYears ?? 0),
            phone:           p.phone ?? '',
          })
        } else if (p.companyProfile) {
          setForm({
            companyName: p.companyProfile.companyName ?? '',
            city:        p.companyProfile.city        ?? '',
            address:     p.companyProfile.address     ?? '',
            website:     p.companyProfile.website     ?? '',
            description: p.companyProfile.description ?? '',
            nip:         p.companyProfile.nip         ?? '',
            phone:       p.phone ?? '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/profile', form)
      Alert.alert('✅', 'Profil został zaktualizowany.')
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać profilu.')
    }
    setSaving(false)
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#ca8a04" />

  const fields = user?.role === 'person'
    ? [
        { key: 'firstName',       label: 'Imię'              },
        { key: 'lastName',        label: 'Nazwisko'          },
        { key: 'phone',           label: 'Telefon'           },
        { key: 'city',            label: 'Miasto'            },
        { key: 'bio',             label: 'O mnie', multi: true },
        { key: 'experienceYears', label: 'Lata doświadczenia', keyboard: 'numeric' as const },
      ]
    : [
        { key: 'companyName', label: 'Nazwa firmy'      },
        { key: 'nip',         label: 'NIP'              },
        { key: 'phone',       label: 'Telefon'          },
        { key: 'city',        label: 'Miasto'           },
        { key: 'address',     label: 'Adres'            },
        { key: 'website',     label: 'Strona www'       },
        { key: 'description', label: 'Opis firmy', multi: true },
      ]

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Nagłówek */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.[0] ?? '?'}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{user?.role === 'person' ? '👤 Osoba prywatna' : '🏢 Firma'}</Text>
        </View>
      </View>

      {/* Formularz */}
      <View style={s.form}>
        {fields.map(field => (
          <View key={field.key}>
            <Text style={s.label}>{field.label}</Text>
            <TextInput
              style={[s.input, field.multi && s.inputMulti]}
              value={form[field.key] ?? ''}
              onChangeText={v => setForm(prev => ({ ...prev, [field.key]: v }))}
              multiline={field.multi}
              keyboardType={field.keyboard ?? 'default'}
              placeholderTextColor="#94a3b8"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#000" />
          : <Text style={s.saveBtnText}>Zapisz profil</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Wyloguj się</Text>
      </TouchableOpacity>

    </ScrollView>
  )
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8fafc' },
  content:     { padding: 20, paddingBottom: 40 },
  header:      { alignItems: 'center', marginBottom: 24 },
  avatar:      { width: 72, height: 72, borderRadius: 20, backgroundColor: '#FACC15', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  name:        { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  email:       { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  roleBadge:   { marginTop: 8, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#fefce8', borderRadius: 20, borderWidth: 1, borderColor: '#fde68a' },
  roleText:    { fontSize: 12, fontWeight: '600', color: '#854d0e' },
  form:        { gap: 14, marginBottom: 20 },
  label:       { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:       { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0f172a' },
  inputMulti:  { height: 100, textAlignVertical: 'top' },
  saveBtn:     { backgroundColor: '#FACC15', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  logoutBtn:   { paddingVertical: 14, alignItems: 'center' },
  logoutText:  { fontSize: 15, color: '#ef4444', fontWeight: '600' },
})
