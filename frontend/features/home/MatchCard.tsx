import { View, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED';

export interface Team {
    name: string;
    logoColor: string;
}

export interface Match {
    id: string;
    league: string;
    status: MatchStatus;
    time: string;
    homeTeam: Team;
    awayTeam: Team;
    homeScore?: number;
    awayScore?: number;
}

interface MatchCardProps {
    match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const isLive = match.status === 'LIVE';

    const cardBorderColor = isLive ? Colors[theme].primary : Colors[theme].border;

    const handlePress = () => {
        router.push({
            pathname: '/protected/match/[id]',
            params: { id: match.id }
        });
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            style={[styles.container, {
                borderColor: cardBorderColor,
                backgroundColor: Colors[theme].card,
                borderWidth: isLive ? 1.5 : 1
            }]}
        >
            {/* Header: League + Time/Status Badge */}
            <View style={styles.header}>
                <ThemedText style={styles.leagueText}>{match.league}</ThemedText>
                <View style={[styles.badge, { backgroundColor: isLive ? '#ff4b4b' : 'rgba(128,128,128,0.2)' }]}>
                    {isLive && <View style={styles.liveDot} />}
                    <ThemedText style={[styles.timeText, { color: isLive ? '#fff' : Colors[theme].text }]}>
                        {match.time}
                    </ThemedText>
                </View>
            </View>

            {/* Teams and Score Row */}
            <View style={styles.matchContent}>
                {/* Home Team */}
                <View style={styles.teamContainer}>
                    <View style={[styles.teamLogo, { backgroundColor: match.homeTeam.logoColor }]} />
                    <ThemedText style={styles.teamName} numberOfLines={1}>{match.homeTeam.name}</ThemedText>
                </View>

                {/* Score / VS */}
                <View style={styles.scoreContainer}>
                    {match.status === 'UPCOMING' ? (
                        <ThemedText style={styles.vsText}>VS</ThemedText>
                    ) : (
                        <ThemedText style={styles.scoreText}>
                            {match.homeScore} - {match.awayScore}
                        </ThemedText>
                    )}
                </View>

                {/* Away Team */}
                <View style={styles.teamContainer}>
                    <ThemedText style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>{match.awayTeam.name}</ThemedText>
                    <View style={[styles.teamLogo, { backgroundColor: match.awayTeam.logoColor }]} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leagueText: {
        fontSize: 12,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        marginRight: 6,
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    matchContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    teamLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginHorizontal: 8,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    scoreContainer: {
        paddingHorizontal: 12,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    vsText: {
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.5,
    },
});
