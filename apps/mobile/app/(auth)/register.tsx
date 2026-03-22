import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, ScrollView,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'

export default function RegisterScreen() {
  const { register } = useAuth()
  const [role,        setRole]        = useState<'person' | 'company'>('person')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [companyName, setCompanyName] = useState('')
  const [city,        setCity]        = useState('')
  const [loading,     setLoading]     = useState(false)

  async function handleRegister() {
    setLoading(true)
    try {
      await register({ email: email.trim(), password, role, firstName, lastName, companyName, city })
    } catch (err: any) {
      Alert.alert('Błąd', err?.response?.data?.error ?? 'Nie udało się zarejestrować.')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">

        <Text style={s.title}>Utwórz konto</Text>
        <Text style={s.subtitle}>Dołącz do platformy PracaTymczasowa</Text>

        {/* Wybór roli */}
        <View style={s.roleRow}>
          {(['person', 'company'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[s.roleBtn, role === r && s.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[s.roleBtnText, role === r && s.roleBtnTextActive]}>
                {r === 'person' ? '👤 Osoba prywatna' : '🏢 Firma'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.form}>
          <TextInput style={s.input} placeholder="Email" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Hasło (min. 8 znaków)" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />

          {role === 'person' ? (
            <>
              <TextInput style={s.input} placeholder="Imię" placeholderTextColor="#94a3b8" value={firstName} onChangeText={setFirstName} />
              <TextInput style={s.input} placeholder="Nazwisko" placeholderTextColor="#94a3b8" value={lastName} onChangeText={setLastName} />
            </>
          ) : (
            <>
              <TextInput style={s.input} placeholder="Nazwa firmy" placeholderTextColor="#94a3b8" value={companyName} onChangeText={setCompanyName} />
              <TextInput style={s.input} placeholder="Miasto" placeholderTextColor="#94a3b8" value={city} onChangeText={setCity} />
            </>
          )}

          <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={s.btnText}>Zarejestruj się</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Masz już konto? </Text>
          <Link href="/(auth)/login">
            <Text style={s.link}>Zaloguj się</Text>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f8fafc' },
  inner:            { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title:            { fontSize: 26, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 6 },
  subtitle:         { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
  roleRow:          { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn:          { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', alignItems: 'center' },
  roleBtnActive:    { borderColor: '#FACC15', backgroundColor: '#fefce8' },
  roleBtnText:      { fontSize: 13, fontWeight: '600', color: '#64748b' },
  roleBtnTextActive:{ color: '#854d0e' },
  form:             { gap: 12 },
  input:            { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0f172a' },
  btn:              { backgroundColor: '#FACC15', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnText:          { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  footer:           { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText:       { color: '#94a3b8', fontSize: 14 },
  link:             { color: '#ca8a04', fontWeight: '700', fontSize: 14 },
})
