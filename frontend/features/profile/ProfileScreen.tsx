import { View, ScrollView, TouchableOpacity, useColorScheme, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/theme';
import { themeStyles } from '@/styles';
import { useSession } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFavorites } from '@/context/FavoritesContext';
import { upsertUserProfile, getUserProfile } from '@/services/supabaseUserService';

export function ProfileScreen() {
    const router = useRouter();
    const { signOut, session } = useSession();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadProfile = async () => {
                if (!session?.user) return;

                try {
                    console.log('Fetching profile for:', session.user.id);
                    // 1. Try to fetch from user_profiles table first
                    const profile = await getUserProfile(session.user.id);
                    console.log('Profile fetched:', profile);

                    if (isActive && profile) {
                        if (profile.avatar_url) {
                            setAvatarUrl(profile.avatar_url);
                            setImageError(false);
                        }
                        if (profile.full_name) setFullName(profile.full_name);
                    }

                    if (isActive && !profile?.avatar_url) {
                        // 2. Fallback to checking storage if not in DB (migration support)
                        downloadImage(session.user.id);
                    }
                } catch (e) {
                    console.error("Error loading profile:", e);
                }
            };

            loadProfile();

            return () => {
                isActive = false;
            };
        }, [session])
    );

    async function downloadImage(userId: string) {
        try {
            const { data, error } = await supabase.storage.from('profilePictures').list(userId + '/', {
                limit: 1,
                sortBy: { column: 'created_at', order: 'desc' },
            });

            if (error) {
                throw error
            }

            if (data && data.length > 0) {
                const fileName = data[0].name;
                const { data: publicUrlData } = supabase.storage.from('profilePictures').getPublicUrl(`${userId}/${fileName}`);
                setAvatarUrl(publicUrlData.publicUrl);
                setImageError(false);
            }
        } catch (error) {
            console.log('Error downloading image: ', error);
        }
    }


    const onSelectImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error picking image', error.message);
            }
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
            const fileName = `avatar.${fileExt}`;
            const filePath = `${session.user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('profilePictures')
                .upload(filePath, arrayBuffer, {
                    contentType: blob.type,
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('profilePictures').getPublicUrl(filePath);
            const publicUrl = data.publicUrl + '?t=' + new Date().getTime(); // Cache busting

            setAvatarUrl(publicUrl);
            setImageError(false);

            // Save Url to user_profiles table using our service
            await upsertUserProfile({
                user_id: session.user.id,
                avatar_url: publicUrl,
            });

        } catch (error) {
            if (error instanceof Error) {
                Alert.alert("Error uploading image", error.message);
            } else {
                Alert.alert("Error uploading image");
            }
        } finally {
            setUploading(false);
        }
    };

    // Mock data based on UI (or fetch real name if available)
    const userData = {
        name: fullName || session?.user?.email?.split('@')[0] || "User",
    };

    const { favoriteLeagues, favoriteSports, favoriteTeams } = useFavorites();

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
            if (confirmed) {
                signOut();
            }
        } else {
            Alert.alert(
                "Cerrar sesión",
                "¿Estás seguro de que quieres cerrar sesión?",
                [
                    {
                        text: "Cancelar",
                        style: "cancel"
                    },
                    {
                        text: "Cerrar sesión",
                        style: "destructive",
                        onPress: async () => {
                            await signOut();
                        }
                    }
                ]
            );
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={{ paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <ThemedText type="title" style={{ fontSize: 24, textAlign: 'center', flex: 1 }}>Profile</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
                {/* Profile Photo Section */}
                <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
                    <TouchableOpacity onPress={onSelectImage}>
                        <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: '#1E1E1E',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: '#00BFFF',
                            marginBottom: 8,
                            overflow: 'hidden'
                        }}>
                            {uploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (avatarUrl && !imageError) ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                    onError={(e) => {
                                        console.log('Image load error:', e.nativeEvent.error);
                                        setImageError(true);
                                    }}
                                />
                            ) : (
                                <Ionicons name="person-outline" size={48} color="#aaa" />
                            )}
                            {!uploading && !avatarUrl && (
                                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4c6ef5', width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: Colors[theme].background, justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="camera" size={16} color="#fff" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <ThemedText style={{ color: Colors[theme].textSecondary, fontSize: 13 }}>Tap to change photo</ThemedText>
                </View>

                {/* Full Name Card */}
                <View style={{ backgroundColor: Colors[theme].card, borderRadius: 16, padding: 16, marginBottom: 24 }}>
                    <ThemedText style={{ color: Colors[theme].textSecondary, fontSize: 13, marginBottom: 4 }}>Full Name</ThemedText>
                    <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>{userData.name}</ThemedText>
                </View>

                {/* Favorite Sports Section */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <ThemedText type="subtitle" style={{ fontSize: 18 }}>Favorite Sports</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/protected/onboarding/select-sports?mode=edit')}>
                            <ThemedText style={{ color: '#4c6ef5', fontWeight: 'bold', fontSize: 14 }}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {favoriteSports.length === 0 ? (
                        <ThemedText style={{ color: Colors[theme].textSecondary, fontStyle: 'italic' }}>No sports selected</ThemedText>
                    ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {favoriteSports.map(sport => (
                                <View key={sport.id || sport.str_sport} style={{
                                    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors[theme].card,
                                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10
                                }}>
                                    <Ionicons name="trophy-outline" size={16} color={Colors[theme].text} style={{ marginRight: 6 }} />
                                    <ThemedText style={{ fontWeight: '500', fontSize: 14 }}>{sport.str_sport}</ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Favorite Leagues Section */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <ThemedText type="subtitle" style={{ fontSize: 18 }}>Favorite Leagues</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/protected/onboarding/select-leagues?mode=edit')}>
                            <ThemedText style={{ color: '#4c6ef5', fontWeight: 'bold', fontSize: 14 }}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {favoriteLeagues.length === 0 ? (
                        <ThemedText style={{ color: Colors[theme].textSecondary, fontStyle: 'italic' }}>No leagues selected</ThemedText>
                    ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {favoriteLeagues.map(league => (
                                <View key={league.id_league} style={{
                                    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors[theme].card,
                                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10
                                }}>
                                    <ThemedText style={{ fontWeight: '500', fontSize: 14 }}>{league.str_league || `League ${league.id_league}`}</ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Favorite Teams Section */}
                <View style={{ marginBottom: 32 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <ThemedText type="subtitle" style={{ fontSize: 18 }}>Favorite Teams</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/protected/onboarding/select-teams?mode=edit')}>
                            <ThemedText style={{ color: '#4c6ef5', fontWeight: 'bold', fontSize: 14 }}>Edit</ThemedText>
                        </TouchableOpacity>
                    </View>
                    {favoriteTeams.length === 0 ? (
                        <ThemedText style={{ color: Colors[theme].textSecondary, fontStyle: 'italic' }}>No teams selected</ThemedText>
                    ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {favoriteTeams.map(team => (
                                <View key={team.id_team} style={{
                                    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors[theme].card,
                                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10
                                }}>
                                    {/* Since we don't have logo loaded yet, show icon or first letter */}
                                    <Ionicons name="shield-outline" size={16} color={Colors[theme].text} style={{ marginRight: 6 }} />
                                    <ThemedText style={{ fontWeight: '500', fontSize: 14 }}>{team.str_team}</ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Logout Button */}
                <ThemedButton
                    title="Logout"
                    onPress={handleLogout}
                    variant="outline"
                    style={{ borderColor: '#ff4b4b' }}
                    textStyle={{ color: '#ff4b4b' }}
                    iconName="log-out-outline"
                    iconColor="#ff4b4b"
                />

            </ScrollView>
        </ThemedView>
    );
}
