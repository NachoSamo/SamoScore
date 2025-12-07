import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { themeStyles } from '@/styles';
import { fetchMatchDetails, MatchDetails, MatchEvent, MatchStat, MatchStatus, TeamSide, EventType } from '@/services/matchesService';
import { BadgeImage } from '@/components/BadgeImage';

// --- Mocks for local fallback/dev (Optional, can be removed if service is 100% reliable) ---
const MOCK_UPCOMING_DETAILS: MatchDetails = {
    id: 'mock-upcoming',
    status: 'upcoming',
    leagueName: 'Premier League',
    date: '2025-05-12',
    time: '20:00',
    stadium: 'Old Trafford',
    city: 'Manchester',
    homeTeam: { id: '1', name: 'Man United', shortName: 'MUN' },
    awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
};

// --- Components ---

const RenderEventIcon = ({ type }: { type: EventType }) => {
    switch (type) {
        case 'goal': return <Ionicons name="football" size={16} color="#fff" />;
        case 'yellow_card': return <View style={{ width: 12, height: 16, backgroundColor: '#FFD700', borderRadius: 2 }} />;
        case 'red_card': return <View style={{ width: 12, height: 16, backgroundColor: '#FF0000', borderRadius: 2 }} />;
        case 'sub': return <Ionicons name="repeat" size={16} color="#00BFFF" />;
        default: return <View />;
    }
};

const FinishedMatchView = ({ match, localStyles, cardBg }: { match: MatchDetails, localStyles: any, cardBg: string }) => {
    return (
        <>
            {/* Match Events Section */}
            <View style={[localStyles.sectionContainer, { backgroundColor: cardBg }]}>
                <ThemedText type="subtitle" style={localStyles.sectionTitle}>Match Events</ThemedText>

                {match.events?.length ? (
                    match.events.map((event) => (
                        <View key={event.id} style={localStyles.eventRow}>
                            {/* Home Side Event */}
                            <View style={[localStyles.eventSide, { alignItems: 'flex-end', paddingRight: 10 }]}>
                                {event.side === 'home' && (
                                    <>
                                        <ThemedText style={localStyles.eventPlayer}>{event.player}</ThemedText>
                                        {event.assist && <ThemedText style={localStyles.eventAssist}>{event.assist}</ThemedText>}
                                    </>
                                )}
                            </View>

                            {/* Timeline Center */}
                            <View style={localStyles.timelineCenter}>
                                <View style={localStyles.timelineLine} />
                                <View style={localStyles.eventIconBubble}>
                                    <RenderEventIcon type={event.type} />
                                </View>
                                <ThemedText style={localStyles.eventTime}>{event.time}</ThemedText>
                            </View>

                            {/* Away Side Event */}
                            <View style={[localStyles.eventSide, { alignItems: 'flex-start', paddingLeft: 10 }]}>
                                {event.side === 'away' && (
                                    <>
                                        <ThemedText style={localStyles.eventPlayer}>{event.player}</ThemedText>
                                        {event.assist && <ThemedText style={localStyles.eventAssist}>{event.assist}</ThemedText>}
                                    </>
                                )}
                            </View>
                        </View>
                    ))
                ) : (
                    <ThemedText style={{ opacity: 0.6, textAlign: 'center' }}>No events available for this match.</ThemedText>
                )}
            </View>

            {/* Statistics Section */}
            {match.stats && match.stats.length > 0 && (
                <View style={[localStyles.sectionContainer, { backgroundColor: cardBg }]}>
                    <ThemedText type="subtitle" style={localStyles.sectionTitle}>Statistics</ThemedText>

                    {match.stats.map((stat, index) => (
                        <View key={index} style={localStyles.statRow}>
                            <View style={localStyles.statValues}>
                                <ThemedText style={localStyles.statValueText}>{stat.homeValue}</ThemedText>
                                <ThemedText style={localStyles.statLabel}>{stat.label}</ThemedText>
                                <ThemedText style={localStyles.statValueText}>{stat.awayValue}</ThemedText>
                            </View>
                            <View style={localStyles.statBarContainer}>
                                {/* Home Bar (Blue) */}
                                <View style={[localStyles.statBar, {
                                    backgroundColor: '#4c6ef5',
                                    width: `${stat.homePercent ?? 0}%`,
                                    borderTopLeftRadius: 4,
                                    borderBottomLeftRadius: 4,
                                }]} />
                                {/* Away Bar (Teal/Green) */}
                                <View style={[localStyles.statBar, {
                                    backgroundColor: '#00ccb1',
                                    width: `${stat.awayPercent ?? 0}%`,
                                    borderTopRightRadius: 4,
                                    borderBottomRightRadius: 4,
                                    alignSelf: 'flex-end'
                                }]} />
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </>
    );
}

const UpcomingMatchView = ({ match, localStyles, cardBg }: { match: MatchDetails, localStyles: any, cardBg: string }) => {
    return (
        <>
            <View style={[localStyles.sectionContainer, { backgroundColor: cardBg }]}>
                <ThemedText type="subtitle" style={localStyles.sectionTitle}>Match Info</ThemedText>

                <View style={localStyles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                    <ThemedText style={localStyles.infoText}>{match.date} • {match.time}</ThemedText>
                </View>

                <View style={localStyles.infoRow}>
                    <Ionicons name="trophy-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                    <ThemedText style={localStyles.infoText}>{match.leagueName}</ThemedText>
                </View>

                {(match.stadium || match.city) && (
                    <View style={localStyles.infoRow}>
                        <Ionicons name="location-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                        <ThemedText style={localStyles.infoText}>
                            {match.stadium}{match.stadium && match.city ? ', ' : ''}{match.city}
                        </ThemedText>
                    </View>
                )}
            </View>

            <View style={[localStyles.sectionContainer, { backgroundColor: cardBg, minHeight: 120, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="people-outline" size={40} color="#555" style={{ marginBottom: 10 }} />
                <ThemedText style={{ opacity: 0.6 }}>Lineups not confirmed yet</ThemedText>
            </View>
        </>
    );
}

export default function MatchDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Dynamic styles based on theme
    const cardBg = Colors[theme].card;
    const textColor = Colors[theme].text;

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            try {
                setLoading(true);
                // If it's the specific mock ID from the prompt/tests, return mock immediately (optional)
                if (id === 'mock-upcoming') {
                    setMatch(MOCK_UPCOMING_DETAILS);
                    setLoading(false);
                    return;
                }

                const data = await fetchMatchDetails(id as string);
                setMatch(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load match details');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    const isUpcoming = match?.status === 'upcoming';
    const isFinished = match?.status === 'finished';

    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
            </ThemedView>
        );
    }

    if (error || !match) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText>{error || 'Match not found'}</ThemedText>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <ThemedText style={{ color: Colors[theme].tint }}>Go Back</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Custom Header */}
            <View style={localStyles.headerBar}>
                <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {match.leagueBadge && (
                        <BadgeImage badgeUrl={match.leagueBadge} size={24} style={{ marginRight: 8 }} />
                    )}
                    <ThemedText style={localStyles.headerTitle}>
                        {match.leagueName || 'Match Details'}
                    </ThemedText>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Scoreboard Card */}
                <View style={[localStyles.scoreboardCard, { backgroundColor: cardBg }]}>
                    <View style={localStyles.timeBadge}>
                        {match.status === 'live' && <View style={localStyles.liveDot} />}
                        <ThemedText style={localStyles.timeText}>
                            {isFinished ? 'Full Time' : isUpcoming ? match.time : match.status.toUpperCase()}
                        </ThemedText>
                    </View>

                    <View style={localStyles.teamsRow}>
                        {/* Home */}
                        <View style={localStyles.teamColumn}>
                            <BadgeImage
                                badgeUrl={match.homeTeam.logoUrl}
                                size={60}
                                style={{ marginBottom: 12 }}
                                placeholderColor="#EF0107"
                            />
                            <ThemedText style={localStyles.teamNameLarge}>{match.homeTeam.shortName}</ThemedText>
                            <ThemedText style={localStyles.teamNameFull}>{match.homeTeam.name}</ThemedText>
                        </View>

                        {/* Score or VS */}
                        <View style={localStyles.scoreColumn}>
                            {isUpcoming ? (
                                <ThemedText style={localStyles.vsTextLarge}>VS</ThemedText>
                            ) : (
                                <ThemedText
                                    style={localStyles.scoreTextLarge}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {match.score?.home ?? 0} - {match.score?.away ?? 0}
                                </ThemedText>
                            )}
                        </View>

                        {/* Away */}
                        <View style={localStyles.teamColumn}>
                            <BadgeImage
                                badgeUrl={match.awayTeam.logoUrl}
                                size={60}
                                style={{ marginBottom: 12 }}
                                placeholderColor="#034694"
                            />
                            <ThemedText style={localStyles.teamNameLarge}>{match.awayTeam.shortName}</ThemedText>
                            <ThemedText style={localStyles.teamNameFull}>{match.awayTeam.name}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Conditional Content */}
                {isUpcoming ? (
                    <UpcomingMatchView match={match} localStyles={localStyles} cardBg={cardBg} />
                ) : (
                    <FinishedMatchView match={match} localStyles={localStyles} cardBg={cardBg} />
                )}

            </ScrollView>
        </ThemedView>
    );
}

const localStyles = StyleSheet.create({
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 14,
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    scoreboardCard: {
        margin: 16,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    timeBadge: {
        backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 24,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff4b4b',
        marginRight: 8,
    },
    timeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    teamsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'flex-start',
    },
    teamColumn: {
        alignItems: 'center',
        width: '30%', // Reduced slightly to give more room to score
    },
    teamLogoLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 12,
    },
    teamNameLarge: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    teamNameFull: {
        fontSize: 12,
        opacity: 0.6,
        textAlign: 'center',
    },
    scoreColumn: {
        width: '40%', // Increased for basketball scores (3 digits)
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    scoreTextLarge: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    vsTextLarge: {
        fontSize: 24,
        fontWeight: 'bold',
        opacity: 0.5,
    },
    sectionContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 24,
        padding: 20,
    },
    sectionTitle: {
        marginBottom: 20,
        fontSize: 18,
    },
    // Events
    eventRow: {
        flexDirection: 'row',
        minHeight: 50,
        marginBottom: 16,
    },
    eventSide: {
        flex: 1,
        justifyContent: 'center',
    },
    timelineCenter: {
        width: 40,
        alignItems: 'center',
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#333',
        zIndex: 0,
    },
    eventIconBubble: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    eventTime: {
        fontSize: 10,
        color: '#4c6ef5',
        fontWeight: 'bold',
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    eventPlayer: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    eventAssist: {
        fontSize: 11,
        opacity: 0.6,
    },
    // Stats
    statRow: {
        marginBottom: 16,
    },
    statValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    statValueText: {
        fontWeight: 'bold',
        fontSize: 14,
        minWidth: 30,
        textAlign: 'center',
    },
    statBarContainer: {
        height: 6,
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statBar: {
        height: '100%',
    },
    // New styles for Upcoming
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
    }
});


