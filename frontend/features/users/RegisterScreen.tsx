import { View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useColorScheme, Image, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/theme';
import { themeStyles } from '@/styles';
import { useSession } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { upsertUserProfile } from '@/services/supabaseUserService';

export function RegisterScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const { signUp } = useSession();

    const onSelectImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatarUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    };

    const uploadAvatar = async (userId: string, uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();
            const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
            const fileName = `avatar.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // We need to handle potential errors gracefully
            const { error: uploadError } = await supabase.storage
                .from('profilePictures')
                .upload(filePath, arrayBuffer, {
                    contentType: blob.type,
                    upsert: true,
                });

            if (uploadError) {
                console.error('Upload Error Details:', uploadError);
                return null;
            }

            const { data } = supabase.storage.from('profilePictures').getPublicUrl(filePath);
            return data.publicUrl + '?t=' + new Date().getTime();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return null;
        }
    };

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }

        setIsSigningUp(true);
        try {
            const { data, error } = await signUp(email, password);

            if (error) {
                // Specific handling for "Signups disabled" to help the user
                if (error.message.includes('signups are disabled')) {
                    Alert.alert('Configuration Error', 'Email signups are disabled in your project. Please enable the "Email" provider in Supabase Dashboard -> Authentication -> Providers.');
                } else {
                    Alert.alert('Registration Failed', error.message);
                }
                return;
            }

            // Check if we have a user
            if (data?.user) {
                const userId = data.user.id;

                // If we have a session (Email Confirm Disabled), we can try to upload/save profile.
                // If we DON'T have a session (Email Confirm Enabled), RLS will likely fail, so we skip this part
                // or we accept that it might fail.

                if (data.session) {
                    try {
                        let finalAvatarUrl = null;

                        // 1. Upload Avatar if selected
                        if (avatarUri) {
                            finalAvatarUrl = await uploadAvatar(userId, avatarUri);
                        }

                        // 2. Create User Profile
                        await upsertUserProfile({
                            user_id: userId,
                            full_name: fullName,
                            avatar_url: finalAvatarUrl,
                        });
                    } catch (profileError) {
                        console.warn('Profile creation non-fatal error:', profileError);
                        // We continue anyway so the user isn't stuck
                    }
                } else {
                    // Email confirmation is ON, so we can't save to DB yet due to RLS usually requiring auth.
                    // We might alert the user, OR if the request is "register without validation", 
                    // this branch shouldn't happen if they configured Supabase correctly.
                    Alert.alert('Verify Email', 'Please check your email to verify your account.');
                    router.back();
                    return;
                }

                // 3. Redirect to Onboarding Flow (seamlessly)
                router.replace('/protected/onboarding/select-sports' as any);
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsSigningUp(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].textSecondary} />
                        <ThemedText style={styles.backButtonText}>Back to login</ThemedText>
                    </TouchableOpacity>

                    {/* Header / Logo Section */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="globe-outline" size={40} color="#fff" />
                        </View>
                        <View>
                            <ThemedText type="title" style={styles.appName}>SamoScore</ThemedText>
                            <ThemedText style={styles.appTagline}>Resultados deportivos al alcance de tu mano</ThemedText>
                        </View>
                    </View>

                    {/* Registration Form Card */}
                    <View style={styles.card}>
                        <ThemedText type="subtitle" style={styles.welcomeText}>Create account</ThemedText>
                        <ThemedText style={styles.subtitleText}>Join millions of sports fans worldwide</ThemedText>

                        {/* Profile Photo Selector */}
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <TouchableOpacity onPress={onSelectImage}>
                                <View style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: Colors[theme].background,
                                    borderWidth: 1,
                                    borderColor: Colors[theme].primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 8,
                                    overflow: 'hidden'
                                }}>
                                    {avatarUri ? (
                                        <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <Ionicons name="camera-outline" size={40} color={Colors[theme].primary} />
                                    )}

                                    {!avatarUri && (
                                        <View style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            backgroundColor: Colors[theme].primary,
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Ionicons name="add" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <ThemedText style={{ fontSize: 12, color: Colors[theme].textSecondary }}>Tap to add photo</ThemedText>
                        </View>

                        <View style={styles.form}>
                            <ThemedInput
                                placeholder="Full Name"
                                leftIconName="person-outline"
                                value={fullName}
                                onChangeText={setFullName}
                            />

                            <ThemedInput
                                placeholder="Email address"
                                leftIconName="mail-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <ThemedInput
                                placeholder="Create password"
                                leftIconName="lock-closed-outline"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />

                            <ThemedInput
                                placeholder="Confirm password"
                                leftIconName="lock-closed-outline"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />

                            <ThemedButton
                                title="Create account"
                                onPress={handleRegister}
                                variant="primary"
                                style={styles.primaryButton}
                                loading={isSigningUp}
                            />

                            <ThemedText style={styles.termsText}>
                                By creating an account, you agree to our <ThemedText style={styles.inlineLinkText}>Terms of Service</ThemedText> and <ThemedText style={styles.inlineLinkText}>Privacy Policy</ThemedText>
                            </ThemedText>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.linkText}>Sign in</ThemedText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
