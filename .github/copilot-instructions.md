# BrainBloom: Copilot Instructions

Kids education + brain games mobile app (React Native, Expo).

## Stack

- Expo (development builds, NOT Expo Go), expo-router, TypeScript (strict)
- react-native-reanimated v4 + react-native-worklets (NOT the old reanimated babel plugin)
- react-native-gesture-handler, @shopify/react-native-skia
- lottie-react-native, expo-linear-gradient, expo-haptics, expo-audio
- react-native-mmkv v4 (needs react-native-nitro-modules), zustand

## Rules

- Functional components + hooks only. No class components.
- Named exports for components (default exports only for expo-router screens).
- All colors, spacing, radius come from `src/core/theme`. Never hardcode values.
- Use `StyleSheet.create`. No inline style objects except animated styles.
- Animations: use Reanimated (`useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`). Do NOT use the core `Animated` API from react-native.
- Game logic = pure TypeScript functions in `logic/` (no React, no UI imports) so it is testable.
- Do not use AsyncStorage. Use MMKV.
- Kids app: minimum touch target 56px, no external links or ads without a parental gate, no personal data collection.
- Any link that leaves the app, and any purchase, must go through `useGate.getState().request(...)`.
- Never add a dependency without telling me first.
- Keep files small. One component per file.

## Structure

src/
core/ { theme, components, hooks, store }
games/<gameName>/ { logic, ui, data }
learning/
