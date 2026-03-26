'use client'
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native'
import { colors, spacing, radius } from '@/lib/ui/theme'

export function PrimaryButton({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.primary} onPress={onPress}>
      <Text style={styles.primaryText}>{children}</Text>
    </TouchableOpacity>
  )
}

export function SecondaryButton({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.secondary} onPress={onPress}>
      <Text style={styles.secondaryText}>{children}</Text>
    </TouchableOpacity>
  )
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.tag}>KATEGORIE</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: radius.pill, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, borderRadius: radius.pill, alignItems: 'center' },
  secondaryText: { color: colors.text, fontWeight: '700' },
  sectionWrap: { marginBottom: 12 },
  tag: { color: colors.primary, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '900', color: colors.text },
})
