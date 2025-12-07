import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchAllLeagues, SportsDbLeague } from '@/services/theSportsDbService';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { themeStyles } from '@/styles';
import { ThemedInput } from '@/components/ThemedInput';

export default function AllLeaguesScreen() {
    const [leagues, setLeagues] = useState<SportsDbLeague[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSport, setSelectedSport] = useState('Soccer');

    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const loadLeagues = async () => {
        setLoading(true);
        const data = await fetchAllLeagues();
        setLeagues(data);
        setLoading(false);
    };

    useEffect(() => {
        loadLeagues();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLeagues();
        setRefreshing(false);
    };

    const uniqueSports = useMemo(() => {
        const sports = Array.from(new Set(leagues.map(l => l.strSport).filter(Boolean)));
        sports.sort();
        // Move Soccer to front if exists
        const soccerIndex = sports.indexOf('Soccer');
        if (soccerIndex > -1) {
            sports.splice(soccerIndex, 1);
            sports.unshift('Soccer');
        }
        return sports;
    }, [leagues]);

    // Update selected sport if current selection is invalid after a refresh, 
    // or keep it if valid. If empty, default to Soccer or first available.
    useEffect(() => {
        if (uniqueSports.length > 0 && !uniqueSports.includes(selectedSport)) {
            setSelectedSport(uniqueSports[0]);
        }
    }, [uniqueSports]);

    const filteredLeagues = useMemo(() => {
        return leagues.filter(league => {
            const matchSport = league.strSport === selectedSport;
            const matchSearch = league.strLeague.toLowerCase().includes(searchQuery.toLowerCase());
            return matchSport && matchSearch;
        });
    }, [leagues, selectedSport, searchQuery]);

    const handleLeaguePress = (league: SportsDbLeague) => {
        router.push(`/protected/standings/${league.idLeague}`);
    };

    const renderItem = ({ item }: { item: SportsDbLeague }) => (
        <TouchableOpacity
            style={[localStyles.itemContainer, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].border }]}
            onPress={() => handleLeaguePress(item)}
        >
            <View style={localStyles.itemContent}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <ThemedText type="defaultSemiBold">{item.strLeague}</ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{item.strSport}</ThemedText>
                    {item.strLeagueAlternate ? (
                        <ThemedText style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{item.strLeagueAlternate}</ThemedText>
                    ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors[theme].textSecondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={localStyles.headerContainer}>
                <ThemedInput
                    placeholder="Search leagues..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIconName="search"
                    containerStyle={{ marginBottom: 12, borderRadius: 25, height: 48 }}
                />

                <View style={{ marginBottom: 8 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}
                    >
                        {uniqueSports.map((sport) => {
                            const isSelected = sport === selectedSport;
                            return (
                                <TouchableOpacity
                                    key={sport}
                                    onPress={() => setSelectedSport(sport)}
                                    style={[
                                        localStyles.sportChip,
                                        {
                                            backgroundColor: isSelected ? Colors[theme].primary : Colors[theme].card,
                                            borderColor: isSelected ? Colors[theme].primary : Colors[theme].border,
                                        }
                                    ]}
                                >
                                    <ThemedText
                                        style={{
                                            color: isSelected ? '#fff' : Colors[theme].text,
                                            fontWeight: isSelected ? '600' : '400',
                                            fontSize: 13
                                        }}
                                    >
                                        {sport}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} color={Colors[theme].primary} />
            ) : (
                <FlatList
                    data={filteredLeagues}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.idLeague}
                    contentContainerStyle={{ padding: 16, paddingTop: 0 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ThemedText>No leagues found.</ThemedText>
                        </View>
                    }
                />
            )}
        </ThemedView>
    );
}

const localStyles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    sportChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContainer: {
        marginBottom: 10,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    itemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
