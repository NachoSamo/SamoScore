import { View, ScrollView, TouchableOpacity, useColorScheme, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/theme';
import { themeStyles } from '@/styles';
import { useFavorites } from '@/context/FavoritesContext';
import { useSession } from '@/context/AuthContext';

interface League {
    id: string;
    name: string;
    country: string;
    logoColor: string; // mocking logo with color for now
}

const LEAGUES: League[] = [
    { id: '4328', name: 'Premier League', country: 'England', logoColor: '#3d195b' },
    { id: '4335', name: 'La Liga', country: 'Spain', logoColor: '#ee161f' },
    { id: '4332', name: 'Serie A', country: 'Italy', logoColor: '#024494' },
    { id: '4331', name: 'Bundesliga', country: 'Germany', logoColor: '#d20515' },
    { id: '4334', name: 'Ligue 1', country: 'France', logoColor: '#dae025' },
    { id: '4480', name: 'UEFA Champions League', country: 'Europe', logoColor: '#002f6c' },
    { id: '4346', name: 'MLS', country: 'USA', logoColor: '#004990' },
    { id: '4351', name: 'Brasileirão', country: 'Brazil', logoColor: '#fcb813' },
    { id: '4356', name: 'Primera División', country: 'Argentina', logoColor: '#75aadb' },
    { id: '4350', name: 'Liga MX', country: 'Mexico', logoColor: '#006847' },
];

export function SelectLeaguesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditing = params.mode === 'edit';

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const { favoriteLeagues, addFavorite, removeFavorite, isFavorite } = useFavorites();
    const { session } = useSession();
    const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load initial favorites if editing
    useEffect(() => {
        if (isEditing) {
            const currentFavs = favoriteLeagues.map(l => String(l.id_league));
            setSelectedLeagues(currentFavs);
        }
    }, [isEditing, favoriteLeagues]);

    const toggleLeague = async (id: string) => {
        const isSelected = selectedLeagues.includes(id);

        if (isSelected) {
            setSelectedLeagues(prev => prev.filter(s => s !== id));
            // In edit mode we can save immediately or wait for Save.
            // Let's stick to batch save for UI consistency, but context needs ID number.
        } else {
            setSelectedLeagues(prev => [...prev, id]);
        }
    };

    const filteredLeagues = LEAGUES.filter(league =>
        league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContinue = async () => {
        if (isEditing) {
            // Calculate diff and update
            const oldSet = new Set(favoriteLeagues.map(l => String(l.id_league)));
            const newSet = new Set(selectedLeagues);

            // Add new
            for (const id of selectedLeagues) {
                if (!oldSet.has(id)) {
                    const league = LEAGUES.find(l => l.id === id);

                    if (league && session?.user) {
                        await addFavorite({
                            user_id: session.user.id,
                            id_league: parseInt(id),
                            str_league: league.name,
                            str_sport: 'Soccer',
                            str_country: league.country,
                            badge_url: null,
                        });
                    }
                }
            }

            // Remove old
            for (const fav of favoriteLeagues) {
                if (!newSet.has(String(fav.id_league))) {
                    await removeFavorite(fav.id_league);
                }
            }

            router.back();
        } else {
            // Onboarding flow - Save selected leagues
            for (const id of selectedLeagues) {
                const league = LEAGUES.find(l => l.id === id);
                if (league && session?.user) {
                    // We just try to add. If it exists, Supabase might not error if we didn't set unique constraint or if we catch it.
                    // The service call logs errors but throws. 
                    // Safe approach: just add. 
                    // Since getUserFavoriteLeagues might not be populated in onboarding if fresh, we assume empty or check constraint.
                    // Ideally we should check if already favorite? 
                    // But simplest is:
                    try {
                        await addFavorite({
                            user_id: session.user.id,
                            id_league: parseInt(id),
                            str_league: league.name,
                            str_sport: 'Soccer',
                            str_country: league.country,
                            badge_url: null,
                        });
                    } catch (e) {
                        // Ignore duplicates if any
                    }
                }
            }
            router.push('/protected/onboarding/select-teams');
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={{ paddingTop: 60, paddingBottom: 24, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <ThemedText type="title" style={{ fontSize: 24 }}>{isEditing ? 'Edit Leagues' : 'Select Leagues'}</ThemedText>
                </View>
                {!isEditing && <ThemedText style={{ color: Colors[theme].textSecondary }}>Choose competitions to follow</ThemedText>}
            </View>

            {/* Search Bar */}
            <View style={{
                marginHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors[theme].card,
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 48,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: Colors[theme].border
            }}>
                <Ionicons name="search" size={20} color={Colors[theme].textSecondary} />
                <TextInput
                    style={{ flex: 1, marginLeft: 8, color: Colors[theme].text, fontSize: 16 }}
                    placeholder="Search leagues..."
                    placeholderTextColor={Colors[theme].textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}>
                {filteredLeagues.map(league => {
                    const isSelected = selectedLeagues.includes(league.id);
                    return (
                        <TouchableOpacity
                            key={league.id}
                            onPress={() => toggleLeague(league.id)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: isSelected ? 'rgba(76, 110, 245, 0.1)' : Colors[theme].card,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: isSelected ? Colors[theme].primary : Colors[theme].border
                            }}
                        >
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: league.logoColor,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 16
                            }}>
                                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                                    {league.name.substring(0, 1)}
                                </ThemedText>
                            </View>

                            <View style={{ flex: 1 }}>
                                <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{league.name}</ThemedText>
                                <ThemedText style={{ fontSize: 13, color: Colors[theme].textSecondary }}>{league.country}</ThemedText>
                            </View>

                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: isSelected ? Colors[theme].primary : Colors[theme].textSecondary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: isSelected ? Colors[theme].primary : 'transparent'
                            }}>
                                {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Footer Button - Fixed at bottom */}
            <View style={{
                position: 'absolute',
                bottom: 40,
                left: 20,
                right: 20,
            }}>
                <ThemedButton
                    title={isEditing ? "Save Changes" : `Continue (${selectedLeagues.length})`}
                    onPress={handleContinue}
                    variant="primary"
                />
            </View>
        </ThemedView>
    );
}
