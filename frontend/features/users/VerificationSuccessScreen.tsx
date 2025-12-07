import { View, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ThemedButton';
import { themeStyles } from '@/styles';
import { Colors } from '@/constants/theme';

export function VerificationSuccessScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const handleContinue = () => {
        // Redirigir al login o a la home si ya hay sesión
        router.replace('/public/login');
    };

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.container, localStyles.content]}>
                <View style={localStyles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color={Colors[theme].primary} />
                </View>

                <ThemedText type="title" style={localStyles.title}>
                    ¡Verificación Exitosa!
                </ThemedText>

                <ThemedText style={localStyles.message}>
                    Tu correo electrónico ha sido verificado correctamente. Ya puedes acceder a todas las funciones de SamoScore.
                </ThemedText>

                <ThemedButton
                    title="Continuar"
                    onPress={handleContinue}
                    variant="primary"
                    style={localStyles.button}
                />
            </View>
        </ThemedView>
    );
}

const localStyles = StyleSheet.create({
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
    },
    message: {
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.8,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        marginTop: 16,
    }
});
