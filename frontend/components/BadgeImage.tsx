import React from 'react';
import { Image, View, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

interface BadgeImageProps {
    badgeUrl?: string | null;
    size?: number;
    placeholderColor?: string;
    style?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
}

export const BadgeImage: React.FC<BadgeImageProps> = ({
    badgeUrl,
    size = 40,
    placeholderColor,
    style,
    containerStyle
}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';

    // Default placeholder color if none provided
    const bg = placeholderColor || (theme === 'dark' ? '#333' : '#e0e0e0');

    const loadedStyle = [
        { width: size, height: size, borderRadius: size / 2 },
        style,
    ] as ImageStyle;

    if (!badgeUrl) {
        return (
            <View
                style={[
                    styles.placeholder,
                    { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
                    containerStyle
                ]}
            />
        );
    }

    return (
        <Image
            source={{ uri: badgeUrl }}
            style={loadedStyle}
            resizeMode="contain"
        />
    );
};

const styles = StyleSheet.create({
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
