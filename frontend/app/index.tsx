import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const handleLogin = () => {
        // TODO: Implement Supabase login
        console.log('Login attempt');
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google login
        console.log('Google login attempt');
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
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
                            />

                            <ThemedInput
                                placeholder="Password"
                                leftIconName="lock-closed-outline"
                                secureTextEntry
                            />

                            <TouchableOpacity style={styles.forgotPassword}>
                                <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
                            </TouchableOpacity>

                            <ThemedButton
                                title="Login"
                                onPress={handleLogin}
                                variant="primary"
                                style={styles.loginButton}
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
                        <TouchableOpacity onPress={() => console.log('Navigate to signup')}>
                            <ThemedText style={styles.signupText}>Sign up</ThemedText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const themeStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        alignSelf: 'center',
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors[theme].primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: Colors[theme].primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    appName: {
        fontSize: 28,
        color: Colors[theme].primary,
    },
    appTagline: {
        fontSize: 12,
        color: Colors[theme].textSecondary,
    },
    card: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: Colors[theme].card,
        borderWidth: 1,
        borderColor: Colors[theme].border,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 8,
    },
    welcomeText: {
        marginBottom: 8,
        textAlign: 'left',
        fontSize: 24,
    },
    subtitleText: {
        marginBottom: 32,
        textAlign: 'left',
        color: Colors[theme].textSecondary,
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: Colors[theme].primary,
        fontSize: 14,
    },
    loginButton: {
        marginBottom: 24,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors[theme].border,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: Colors[theme].textSecondary,
    },
    footer: {
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: 14,
    },
    signupText: {
        fontSize: 14,
        color: Colors[theme].success,
        fontWeight: 'bold',
    },
});
