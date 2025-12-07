import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ProtectedLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';

    return (
        <FavoritesProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Drawer
                    screenOptions={{
                        headerShown: false, // We use our own headers or none for clean look
                        drawerActiveTintColor: Colors[theme].primary,
                        drawerInactiveTintColor: Colors[theme].textSecondary,
                        drawerStyle: {
                            backgroundColor: Colors[theme].card,
                        },
                    }}
                >
                    <Drawer.Screen
                        name="index" // The Home Screen
                        options={{
                            drawerLabel: 'Home',
                            title: 'Home',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="home-outline" size={size} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="leagues" // The All Leagues Screen
                        options={{
                            drawerLabel: 'Leagues',
                            title: 'All Leagues',
                            headerShown: true, // Show header for Leagues screen so user can open drawer
                            headerStyle: { backgroundColor: Colors[theme].background },
                            headerTintColor: Colors[theme].text,
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="trophy-outline" size={size} color={color} />
                            ),
                        }}
                    />

                    {/* Hidden Routes (Detail screens, etc.) */}
                    <Drawer.Screen
                        name="profile/index"
                        options={{
                            drawerItemStyle: { display: 'none' },
                            title: 'Profile',
                        }}
                    />
                    <Drawer.Screen
                        name="standings/[id]"
                        options={{
                            drawerItemStyle: { display: 'none' },
                            title: 'Standings',
                            headerShown: true,
                        }}
                    />
                    <Drawer.Screen
                        name="match/[id]"
                        options={{
                            drawerItemStyle: { display: 'none' },
                            title: 'Match Details',
                            headerShown: true,
                        }}
                    />
                    <Drawer.Screen
                        name="onboarding" // Refers to onboarding/_layout.tsx now
                        options={{
                            drawerItemStyle: { display: 'none' },
                            headerShown: false,
                        }}
                    />
                </Drawer>
            </GestureHandlerRootView>
        </FavoritesProvider>
    );
}
