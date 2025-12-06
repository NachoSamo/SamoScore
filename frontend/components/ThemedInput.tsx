import { TextInput, StyleSheet, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Colors } from '@/constants/theme';

type ThemedInputProps = {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    leftIconName?: keyof typeof Ionicons.glyphMap;
    rightIconName?: keyof typeof Ionicons.glyphMap; // Only for non-password fields if needed, or explicitly for password
    onRightIconPress?: () => void;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    containerStyle?: object;
};

export function ThemedInput({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    leftIconName,
    rightIconName,
    onRightIconPress,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    containerStyle,
}: ThemedInputProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const styles = themeStyles(theme);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = secureTextEntry !== undefined;
    const actualSecureTextEntry = isPassword && !isPasswordVisible;

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {leftIconName && (
                <Ionicons
                    name={leftIconName}
                    size={20}
                    color={Colors[theme].icon}
                    style={styles.iconLeft}
                />
            )}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors[theme].icon}
                secureTextEntry={actualSecureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
            />
            {isPassword ? (
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconRight}>
                    <Ionicons
                        name={isPasswordVisible ? 'eye-off' : 'eye'}
                        size={20}
                        color={Colors[theme].icon}
                    />
                </TouchableOpacity>
            ) : rightIconName ? (
                <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>
                    <Ionicons
                        name={rightIconName}
                        size={20}
                        color={Colors[theme].icon}
                    />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const themeStyles = (theme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors[theme].background, // Input matches background, or use card if different logic desired
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors[theme].border,
    },
    input: {
        flex: 1,
        color: Colors[theme].text,
        fontSize: 16,
    },
    iconLeft: {
        marginRight: 12,
    },
    iconRight: {
        marginLeft: 12,
    },
});
