import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, useColorScheme, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type ThemedButtonProps = {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    iconName?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    iconColor?: string;
};

export function ThemedButton({
    title,
    onPress,
    variant = 'primary',
    iconName,
    loading = false,
    style,
    textStyle,
    iconColor,
}: ThemedButtonProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryText;
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.baseButton, getButtonStyle(), style]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors[theme].text} />
            ) : (
                <>
                    {iconName && (
                        <Ionicons
                            name={iconName}
                            size={20}
                            color={iconColor || (variant === 'primary' ? '#fff' : Colors[theme].text)}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const themeStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    baseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        marginBottom: 16,
    },
    baseText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    primaryButton: {
        backgroundColor: Colors[theme].primary,
        shadowColor: Colors[theme].primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    primaryText: {
        color: '#fff',
    },
    secondaryButton: {
        backgroundColor: Colors[theme].card,
        borderWidth: 1,
        borderColor: Colors[theme].border,
    },
    secondaryText: {
        color: Colors[theme].text,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors[theme].border,
    },
    outlineText: {
        color: Colors[theme].text,
    },
});
