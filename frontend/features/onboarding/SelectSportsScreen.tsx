import { View, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, TextInput } from 'react-native';
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

interface Sport {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const SPORTS: Sport[] = [
    { id: '1', name: 'Soccer', icon: 'football-outline' },
    { id: '2', name: 'Basketball', icon: 'basketball-outline' },
    { id: '3', name: 'Tennis', icon: 'tennisball-outline' },
    { id: '4', name: 'Cycling', icon: 'bicycle-outline' },
    { id: '5', name: 'Rugby', icon: 'american-football-outline' },
    { id: '6', name: 'Athletics', icon: 'medal-outline' },
    { id: '7', name: 'Swimming', icon: 'water-outline' },
    { id: '8', name: 'Volleyball', icon: 'accessibility-outline' },
    { id: '9', name: 'Golf', icon: 'golf-outline' },
    { id: '10', name: 'Motorsport', icon: 'car-sport-outline' },
];

export function SelectSportsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditing = params.mode === 'edit';

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const { favoriteSports, addFavoriteSport, removeFavoriteSport } = useFavorites();
    const { session } = useSession();
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isEditing) {
            const current = favoriteSports.map(s => s.str_sport);
            setSelectedSports(current);
        }
    }, [isEditing, favoriteSports]);

    const toggleSport = (name: string) => {
        setSelectedSports(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    const filteredSports = SPORTS.filter(sport =>
        sport.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContinue = async () => {
        const oldSet = new Set(favoriteSports.map(s => s.str_sport));
        const newSet = new Set(selectedSports);

        // Additions
        for (const name of selectedSports) {
            if (!oldSet.has(name)) {
                if (session?.user) {
                    try {
                        await addFavoriteSport({
                            user_id: session.user.id,
                            str_sport: name
                        });
                    } catch (e) { }
                }
            }
        }

        // Removals
        if (isEditing) {
            for (const fav of favoriteSports) {
                if (!newSet.has(fav.str_sport)) {
                    await removeFavoriteSport(fav.str_sport);
                }
            }
            router.back();
        } else {
            router.push('/protected/onboarding/select-leagues');
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={{ paddingTop: 60, paddingBottom: 24, paddingHorizontal: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    {isEditing && (
                        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 16, zIndex: 10 }}>
                            <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                        </TouchableOpacity>
                    )}
                    <ThemedText type="title" style={{ textAlign: 'center', fontSize: 28, marginBottom: 8, flex: 1 }}>{isEditing ? 'Edit Sports' : 'Choose Your Sports'}</ThemedText>
                </View>
                {!isEditing && <ThemedText style={{ textAlign: 'center', color: Colors[theme].textSecondary }}>Select the sports you want to follow</ThemedText>}
            </View>

            {/* Search Bar */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors[theme].card,
                borderRadius: 12,
                paddingHorizontal: 12,
                height: 48,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: Colors[theme].border,
                marginHorizontal: 16
            }}>
                <Ionicons name="search" size={20} color={Colors[theme].textSecondary} />
                <TextInput
                    style={{ flex: 1, marginLeft: 8, color: Colors[theme].text, fontSize: 16 }}
                    placeholder="Search sports..."
                    placeholderTextColor={Colors[theme].textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }}>
                    {filteredSports.map(sport => {
                        // Use sport.name as key identifier logic for simplicity as `str_sport`
                        const isSelected = selectedSports.includes(sport.name);
                        return (
                            <TouchableOpacity
                                key={sport.id}
                                onPress={() => toggleSport(sport.name)}
                                activeOpacity={0.7}
                                style={{
                                    width: '48%',
                                    aspectRatio: 1,
                                    backgroundColor: isSelected ? Colors[theme].primary : Colors[theme].card,
                                    borderRadius: 16,
                                    marginBottom: 16,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: isSelected ? Colors[theme].primary : Colors[theme].border
                                }}
                            >
                                <View style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(128,128,128,0.1)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 16
                                }}>
                                    <Ionicons
                                        name={sport.icon}
                                        size={32}
                                        color={isSelected ? '#fff' : Colors[theme].primary}
                                    />
                                </View>
                                <ThemedText style={{
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                    color: isSelected ? '#fff' : Colors[theme].text
                                }}>
                                    {sport.name}
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
                    title={isEditing ? "Save Changes" : `Continue (${selectedSports.length} selected)`}
                    onPress={handleContinue}
                    variant="primary"
                />
            </View>
        </ThemedView>
    );
}
