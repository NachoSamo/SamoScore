import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const themeStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
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
    primaryButton: {
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
    linkText: {
        fontSize: 14,
        color: Colors[theme].success, // or primary depending on usage
        fontWeight: 'bold',
    },
    // Register specific
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    backButtonText: {
        marginLeft: 8,
        color: Colors[theme].textSecondary,
        fontSize: 16,
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        color: Colors[theme].textSecondary,
        lineHeight: 18,
    },
    inlineLinkText: {
        color: Colors[theme].primary,
        fontSize: 12,
    },
});
