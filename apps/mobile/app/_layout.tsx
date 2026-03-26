import { StatusBar } from 'expo-status-bar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StatusBar style="dark" />
      {children}
    </>
  )
}
