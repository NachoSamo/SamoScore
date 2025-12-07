import { View, ScrollView, TouchableOpacity, useColorScheme, TextInput, Image } from 'react-native';
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

interface Team {
    id: string;
    name: string;
    sport: string;
    logoColor: string;
}

const TEAMS: Team[] = [
    { id: '133604', name: 'Real Madrid', sport: 'Soccer', logoColor: '#FEBE10' },
    { id: '133601', name: 'FC Barcelona', sport: 'Soccer', logoColor: '#A50044' },
    { id: '133613', name: 'Manchester City', sport: 'Soccer', logoColor: '#6CABDD' },
    { id: '133602', name: 'Liverpool', sport: 'Soccer', logoColor: '#C8102E' },
    { id: '133600', name: 'Arsenal', sport: 'Soccer', logoColor: '#EF0107' },
    { id: '133714', name: 'Paris Saint-Germain', sport: 'Soccer', logoColor: '#004170' },
    { id: '133664', name: 'Bayern Munich', sport: 'Soccer', logoColor: '#DC052D' },
    { id: '134867', name: 'Los Angeles Lakers', sport: 'Basketball', logoColor: '#552583' },
    { id: '134865', name: 'Golden State Warriors', sport: 'Basketball', logoColor: '#1D428A' },
    // Some mock IDs for motorsports if needed, or remove
    { id: '135913', name: 'Ferrari', sport: 'Motorsport', logoColor: '#FF2800' },
    { id: '135914', name: 'Red Bull Racing', sport: 'Motorsport', logoColor: '#0600EF' },
    { id: '138138', name: 'Inter Miami CF', sport: 'Soccer', logoColor: '#F7B5CD' },
];

export function SelectTeamsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditing = params.mode === 'edit';

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const { favoriteTeams, addFavoriteTeam, removeFavoriteTeam, isFavoriteTeam } = useFavorites();
    const { session } = useSession();
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isEditing) {
            const current = favoriteTeams.map(t => String(t.id_team));
            setSelectedTeams(current);
        }
    }, [isEditing, favoriteTeams]);

    const toggleTeam = (id: string) => {
        setSelectedTeams(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const filteredTeams = TEAMS.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.sport.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFinish = async () => {
        const oldSet = new Set(favoriteTeams.map(t => String(t.id_team)));
        const newSet = new Set(selectedTeams);

        // Additions
        for (const id of selectedTeams) {
            if (!oldSet.has(id)) {
                const team = TEAMS.find(t => t.id === id);
                if (team && session?.user) {
                    try {
                        await addFavoriteTeam({
                            user_id: session.user.id,
                            id_team: parseInt(id),
                            str_team: team.name,
                            str_sport: team.sport,
                            str_league: '', // Unknown from this mock context
                            str_country: '',
                            badge_url: null
                        });
                    } catch (e) {
                        // ignore
                    }
                }
            }
        }

        // Removals (only if editing, or if we want strict sync on onboarding too)
        if (isEditing) {
            for (const fav of favoriteTeams) {
                if (!newSet.has(String(fav.id_team))) {
                    await removeFavoriteTeam(fav.id_team);
                }
            }
            router.back();
        } else {
            // Mark onboarding as complete for new users
            if (session?.user) {
                const { completeOnboarding } = await import('@/services/supabaseUserService');
                await completeOnboarding(session.user.id);
            }
            router.replace('/protected'); // Home
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
                    <ThemedText type="title" style={{ fontSize: 24 }}>{isEditing ? 'Edit Teams' : 'Select Teams'}</ThemedText>
                </View>
                {!isEditing && <ThemedText style={{ color: Colors[theme].textSecondary }}>Follow your favorite teams</ThemedText>}
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
                    placeholder="Search teams..."
                    placeholderTextColor={Colors[theme].textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {filteredTeams.map(team => {
                        const isSelected = selectedTeams.includes(team.id);
                        return (
                            <TouchableOpacity
                                key={team.id}
                                onPress={() => toggleTeam(team.id)}
                                activeOpacity={0.7}
                                style={{
                                    width: '31%', // 3 columns
                                    aspectRatio: 0.8,
                                    backgroundColor: isSelected ? 'rgba(76, 110, 245, 0.1)' : Colors[theme].card,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: isSelected ? Colors[theme].primary : Colors[theme].border,
                                    padding: 8
                                }}
                            >
                                <View style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: team.logoColor,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }}>
                                    <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                                        {team.name.substring(0, 2).toUpperCase()}
                                    </ThemedText>
                                </View>

                                <ThemedText style={{
                                    fontSize: 12,
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: isSelected ? Colors[theme].primary : Colors[theme].text
                                }} numberOfLines={2}>
                                    {team.name}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer Button - Fixed at bottom */}
            <View style={{
                position: 'absolute',
                bottom: 40,
                left: 20,
                right: 20,
            }}>
                <ThemedButton
                    title={isEditing ? "Save Changes" : `Finish (${selectedTeams.length})`}
                    onPress={handleFinish}
                    variant="primary"
                />
            </View>
        </ThemedView>
    );
}
