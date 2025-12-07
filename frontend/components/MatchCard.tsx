import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { MatchCardData } from '@/services/matchesService';
import { BadgeImage } from '@/components/BadgeImage';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface MatchCardProps {
    data: MatchCardData;
}

export const MatchCard: React.FC<MatchCardProps> = ({ data }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';

    // Status Logic - already normalized in service or raw? 
    // The service maps status: e.strStatus.
    // We can rely on string checks again or improve normalization later.
    const isLive = data.status === 'Match Started' || data.status === 'First Half' || data.status === 'Second Half' || data.status === 'HT' || data.rawStatus?.toLowerCase().includes('live');
    const isFinished = data.status === 'Match Finished' || data.status === 'FT' || data.rawStatus?.toLowerCase().includes('finish');
    const isUpcoming = !isLive && !isFinished;

    const handlePress = () => {
        router.push(`/protected/match/${data.id}` as any);
    };

    // Time formatting is already done in service: data.time (HH:MM)
    // But specific date parsing for locale might be nice if data.time is just string.
    // The service returns substring(0,5).

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[
                styles.card,
                { backgroundColor: Colors[theme].card, borderColor: isLive ? '#ff4b4b' : Colors[theme].border },
                isLive && styles.liveCardBorder
            ]}
            activeOpacity={0.8}
        >
            {/* Header: League Name + Badge */}
            <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* League Badge - Optional */}
                    {data.leagueBadge && (
                        <BadgeImage badgeUrl={data.leagueBadge} size={18} style={{ marginRight: 8 }} />
                    )}
                    <Text style={[styles.leagueName, { color: Colors[theme].textSecondary }]}>
                        {data.leagueName?.toUpperCase()}
                    </Text>
                </View>

                {/* Status Badge */}
                {isLive ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#3e1a1a' }]}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveTimeText}>LIVE</Text>
                    </View>
                ) : isFinished ? (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(128,128,128,0.2)' }]}>
                        <Text style={[styles.statusText, { color: Colors[theme].textSecondary }]}>FT</Text>
                    </View>
                ) : (
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,165,0,0.1)' }]}>
                        <Text style={[styles.statusText, { color: '#ffa500' }]}>UPC</Text>
                    </View>
                )}
            </View>

            {/* Match Content */}
            <View style={styles.matchContent}>
                {/* Home Team */}
                <View style={styles.teamSide}>
                    <BadgeImage
                        badgeUrl={data.homeTeam.badgeUrl}
                        size={28}
                        placeholderColor="#ef4444" // Keep red as fallback for home? or just neutral
                    />
                    <Text
                        numberOfLines={1}
                        style={[styles.teamName, { color: Colors[theme].text }]}
                    >
                        {data.homeTeam.name}
                    </Text>
                </View>

                {/* Score / Time */}
                <View style={styles.centerScore}>
                    {isUpcoming ? (
                        <Text style={[styles.timeText, { color: '#4c6ef5' }]}>
                            {data.time}
                        </Text>
                    ) : (
                        <Text
                            style={[styles.scoreText, { color: Colors[theme].text }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {data.homeScore ?? 0}  -  {data.awayScore ?? 0}
                        </Text>
                    )}
                </View>

                {/* Away Team */}
                <View style={[styles.teamSide, { justifyContent: 'flex-end' }]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.teamName, { color: Colors[theme].text, textAlign: 'right' }]}
                    >
                        {data.awayTeam.name}
                    </Text>
                    <BadgeImage
                        badgeUrl={data.awayTeam.badgeUrl}
                        size={28}
                        placeholderColor="#3b82f6"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    liveCardBorder: {
        borderWidth: 1,
        borderColor: '#ff4b4b',
        // Optional: formatting for live card background if specific color needed
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leagueName: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ff4b4b',
        marginRight: 4,
    },
    liveTimeText: {
        color: '#ff4b4b',
        fontSize: 10,
        fontWeight: '800',
    },
    matchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    teamSide: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    teamLogoPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    teamName: {
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 1,
    },
    centerScore: {
        width: 120, // Increased to fit 3-digit scores (e.g. 126 - 105)
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 1,
        textAlign: 'center', // Ensure centered if it wraps or is tight
    },
    timeText: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});
