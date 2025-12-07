import { View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useColorScheme } from 'react-native';
import { useState } from 'react';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { themeStyles } from '@/styles';
import { useSession } from '@/context/AuthContext';

export function LoginScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { signIn } = useSession();

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please fill in both email and password');
            return;
        }

        setIsLoggingIn(true);
        try {
            const { error, data } = await signIn(email, password);
            if (error) {
                alert(error.message);
            } else {
                // Check onboarding status
                if (data.session?.user) {
                    const { ensureUserProfileExists } = await import('@/services/supabaseUserService');
                    const profile = await ensureUserProfileExists(data.session.user.id, email);

                    if (!profile?.has_completed_onboarding) {
                        router.replace('/protected/onboarding/select-sports' as any);
                    } else {
                        router.replace('/protected');
                    }
                } else {
                    router.replace('/protected');
                }
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google login
        console.log('Google login attempt');
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

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

                    {/* Login Form Card */}
                    <View style={styles.card}>
                        <ThemedText type="subtitle" style={styles.welcomeText}>Welcome back</ThemedText>
                        <ThemedText style={styles.subtitleText}>Sign in to continue tracking your favorite sports</ThemedText>

                        <View style={styles.form}>
                            <ThemedInput
                                placeholder="Email address"
                                leftIconName="mail-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <ThemedInput
                                placeholder="Password"
                                leftIconName="lock-closed-outline"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />

                            <TouchableOpacity style={styles.forgotPassword}>
                                <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
                            </TouchableOpacity>

                            <ThemedButton
                                title="Login"
                                onPress={handleLogin}
                                variant="primary"
                                style={styles.primaryButton}
                                loading={isLoggingIn}
                            />

                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <ThemedText style={styles.dividerText}>or continue with</ThemedText>
                                <View style={styles.dividerLine} />
                            </View>

                            <ThemedButton
                                title="Google"
                                onPress={handleGoogleLogin}
                                variant="secondary"
                                iconName="logo-google"
                            />
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
                        <TouchableOpacity onPress={() => router.push('/public/register' as Href)}>
                            <ThemedText style={styles.linkText}>Sign up</ThemedText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
