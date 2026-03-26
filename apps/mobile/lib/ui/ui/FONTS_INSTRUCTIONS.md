/*
  Fonts and icons installation instructions for mobile app (Expo)

  1) Copy web fonts from: ../web/public/fonts to mobile app assets/fonts
     - Files already present in web: Omnes*.ttf and Inter variable ttf

  2) Create assets/fonts folder in mobile app and paste needed .ttf files
     Recommended: Omnes Regular/Bold/SemiBold/ExtraLight + Inter variable

  3) Register fonts in expo: edit app.json or app.config.js if using expo, and use expo-font
     Install: npm install expo-font

  4) Create a hook to load fonts at app root (app/_layout.tsx) using useFonts

  Example code (create app/ui/useFonts.tsx):
*/

import { useFonts } from 'expo-font'

export function useAppFonts() {
  const [loaded] = useFonts({
    'Omnes-Regular': require('../../web/public/fonts/Omnes Regular.ttf'),
    'Omnes-SemiBold': require('../../web/public/fonts/Omnes SemiBold.ttf'),
    'Inter-Variable': require('../../web/public/fonts/Inter-VariableFont_opsz,wght.ttf'),
  })
  return loaded
}
