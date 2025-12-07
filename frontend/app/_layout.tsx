import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SessionProvider, useSession } from '@/context/AuthContext';

function InitialLayout() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  /* @ts-ignore */
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === 'protected';

    if (session && !inAuthGroup) {
      router.replace('/protected' as Href);
    } else if (!session && segments[0] !== 'public') {
      router.replace('/public/login' as Href);
    }
  }, [session, segments, isLoading, rootNavigationState]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <InitialLayout />
    </SessionProvider>
  );
}
