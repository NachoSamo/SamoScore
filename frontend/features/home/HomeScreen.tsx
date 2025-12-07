import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { themeStyles } from '@/styles';
import { DateSelector } from './DateSelector';
import { MatchCard } from '@/components/MatchCard';
import { fetchMatchesByDay, MatchCardData } from '@/services/matchesService';
import { useFavorites } from '@/context/FavoritesContext';
import { useSession } from '@/context/AuthContext';
import { getUserProfile } from '@/services/supabaseUserService';
import { supabase } from '@/lib/supabase';

export function HomeScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const { session } = useSession();
    const { favoriteLeagues, favoriteTeams, favoriteSports } = useFavorites();
    const [events, setEvents] = useState<MatchCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const openDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    // Initialize date with today
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    useEffect(() => {
        const loadAvatar = async () => {
            if (!session?.user) return;

            try {
                // 1. Try to fetch from user_profiles table first
                const profile = await getUserProfile(session.user.id);
                if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                    return;
                }

                // 2. Fallback to checking storage if not in DB
                const { data } = await supabase.storage.from('profilePictures').list(session.user.id + '/', {
                    limit: 1,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

                if (data && data.length > 0) {
                    const fileName = data[0].name;
                    const { data: publicUrlData } = supabase.storage.from('profilePictures').getPublicUrl(`${session.user.id}/${fileName}`);
                    setAvatarUrl(publicUrlData.publicUrl);
                }
            } catch (error) {
                console.log('Error loading avatar:', error);
            }
        };

        loadAvatar();
    }, [session]);

    const loadMatches = async (dateStr: string) => {
        setLoading(true);
        try {
            let allEvents: MatchCardData[] = [];

            // Determine which sports to fetch
            const sportsToFetch = favoriteSports.length > 0
                ? favoriteSports.map(s => s.str_sport)
                : ['Soccer'];

            // Fetch for each sport
            for (const sport of sportsToFetch) {
                const sportEvents = await fetchMatchesByDay(dateStr, sport);
                if (sportEvents) {
                    allEvents = [...allEvents, ...sportEvents];
                }
            }

            setEvents(allEvents);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMatches(selectedDate);
    }, [selectedDate, favoriteSports]); // Reload if date or preferences change

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMatches(selectedDate);
        setRefreshing(false);
    };

    // Filter events based on favorites
    const filteredEvents = React.useMemo(() => {
        if (!events) return [];

        // If user has no favorites set up at all, show everything fetched (default behavior)
        const hasLeagues = favoriteLeagues.length > 0;
        const hasTeams = favoriteTeams.length > 0;

        if (!hasLeagues && !hasTeams) {
            return events;
        }

        const favLeagueIds = new Set(favoriteLeagues.map(f => String(f.id_league)));
        const favTeamIds = new Set(favoriteTeams.map(f => String(f.id_team)));

        return events.filter(e => {
            // Check if League is favorite
            if (favLeagueIds.has(e.leagueId)) return true;

            // Check if either team is favorite. 
            if (e.homeTeam.id && favTeamIds.has(e.homeTeam.id)) return true;
            if (e.awayTeam.id && favTeamIds.has(e.awayTeam.id)) return true;

            return false;
        });
    }, [events, favoriteLeagues, favoriteTeams]);

    // Group by status
    const liveEvents = filteredEvents.filter(e => e.status === 'Match Started' || e.status === 'First Half' || e.status === 'Second Half' || e.status === 'HT');
    const finishedEvents = filteredEvents.filter(e => e.status === 'Match Finished' || e.status === 'FT');

    // All others are upcoming
    const upcomingEvents = filteredEvents.filter(e =>
        !liveEvents.includes(e) && !finishedEvents.includes(e)
    );

    const renderSection = (title: string, data: MatchCardData[]) => {
        if (data.length === 0) return null;
        return (
            <View>
                <View style={localStyles.sectionHeader}>
                    {title === 'LIVE NOW' && <View style={localStyles.sectionDot} />}
                    <ThemedText type="subtitle" style={localStyles.sectionTitle}>{title}</ThemedText>
                </View>
                {data.map(event => (
                    <MatchCard key={event.id} data={event} />
                ))}
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header: Today's Matches & Profile */}
            <View style={[localStyles.headerRow, { marginTop: 60 }]}>
                <TouchableOpacity onPress={openDrawer} style={localStyles.appIcon}>
                    <Ionicons name="menu" size={24} color="#fff" />
                </TouchableOpacity>
                <ThemedText type="title" style={{ flex: 1, marginLeft: 12 }}>Matches</ThemedText>
                <TouchableOpacity onPress={() => router.push('/protected/profile' as any)} style={localStyles.profileButton}>
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Ionicons name="person-outline" size={20} color={Colors[theme].text} />
                    )}
                </TouchableOpacity>
            </View>

            <DateSelector onDateChange={setSelectedDate} />

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 10 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {filteredEvents.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ThemedText>No matches found today.</ThemedText>
                        </View>
                    ) : (
                        <>
                            {renderSection('LIVE NOW', liveEvents)}
                            {renderSection('UPCOMING', upcomingEvents)}
                            {renderSection('FINISHED', finishedEvents)}
                        </>
                    )}
                </ScrollView>
            )}
        </ThemedView>
    );
}

const localStyles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    appIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#4c6ef5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(128,128,128,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 10,
        paddingHorizontal: 16,
    },
    sectionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ff4b4b',
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.7,
        textTransform: 'uppercase',
    }
});
