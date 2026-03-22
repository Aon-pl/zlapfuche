import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Błąd', 'Wypełnij wszystkie pola.'); return }
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      Alert.alert('Błąd', err?.response?.data?.error ?? 'Nie udało się zalogować.')
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>

        <View style={s.logo}>
          <Text style={s.logoText}>PT</Text>
        </View>
        <Text style={s.title}>Witaj z powrotem</Text>
        <Text style={s.subtitle}>Zaloguj się do swojego konta</Text>

        <View style={s.form}>
          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={s.input}
            placeholder="Hasło"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={s.btnText}>Zaloguj się</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Nie masz konta? </Text>
          <Link href="/(auth)/register">
            <Text style={s.link}>Zarejestruj się</Text>
          </Link>
        </View>

      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f8fafc' },
  inner:      { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logo:       { width: 56, height: 56, backgroundColor: '#FACC15', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24, alignSelf: 'center' },
  logoText:   { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  title:      { fontSize: 26, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 6 },
  subtitle:   { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 32 },
  form:       { gap: 12 },
  input:      { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0f172a' },
  btn:        { backgroundColor: '#FACC15', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnText:    { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#94a3b8', fontSize: 14 },
  link:       { color: '#ca8a04', fontWeight: '700', fontSize: 14 },
})
