import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchLeagueTable, SportsDbTableEntry, fetchLeagueDetails, SportsDbLeague } from '@/services/theSportsDbService';
import { Image } from 'expo-image';

export default function StandingsScreen() {
    const { id } = useLocalSearchParams();
    const [table, setTable] = useState<SportsDbTableEntry[]>([]);
    const [league, setLeague] = useState<SportsDbLeague | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [tableData, leagueData] = await Promise.all([
                    fetchLeagueTable(id as string, '2025-2026'), // Updated to latest season
                    fetchLeagueDetails(id as string)
                ]);
                setTable(tableData);
                setLeague(leagueData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const renderItem = ({ item }: { item: SportsDbTableEntry }) => (
        <View style={styles.row}>
            <Text style={styles.rank}>{item.intRank}</Text>
            <View style={styles.team}>
                <Image source={{ uri: item.strTeamBadge }} style={styles.badge} />
                <Text style={styles.teamName} numberOfLines={1}>{item.strTeam}</Text>
            </View>
            <Text style={styles.stat}>{item.intPlayed}</Text>
            <Text style={styles.stat}>{item.intGoalDifference}</Text>
            <Text style={styles.points}>{item.intPoints}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {league && (
                <View style={styles.header}>
                    <Text style={styles.title}>{league.strLeague}</Text>
                </View>
            )}
            <View style={styles.tableHeader}>
                <Text style={styles.rank}>#</Text>
                <Text style={[styles.team, { paddingLeft: 8 }]}>Team</Text>
                <Text style={styles.stat}>P</Text>
                <Text style={styles.stat}>GD</Text>
                <Text style={styles.points}>Pts</Text>
            </View>
            <FlatList
                data={table}
                keyExtractor={(item) => item.idTeam}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#e9ecef',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        alignItems: 'center',
    },
    rank: {
        width: 30,
        fontWeight: 'bold',
        color: '#666',
        textAlign: 'center',
    },
    team: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    teamName: {
        fontSize: 14,
        color: '#333',
    },
    stat: {
        width: 30,
        textAlign: 'center',
        fontSize: 13,
        color: '#555',
    },
    points: {
        width: 40,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
    },
    listContent: {
        paddingBottom: 20,
    },
});
