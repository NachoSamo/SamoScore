import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface DateItem {
    id: string; // YYYY-MM-DD
    dayName: string; // Mon, Tue...
    dayNumber: string; // 1, 2...
    fullDate: Date;
}

interface DateSelectorProps {
    onDateChange: (date: string) => void;
}

const ITEM_WIDTH = 60;
const ITEM_SPACING = 10;
const TOTAL_WIDTH = ITEM_WIDTH + ITEM_SPACING;

export function DateSelector({ onDateChange }: DateSelectorProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const flatListRef = useRef<FlatList>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Generate dates: +/- 180 days (approx 1 year range total)
    const datesData = useMemo(() => {
        const tempDates: DateItem[] = [];
        const today = new Date();
        const start = -180;
        const end = 180;

        for (let i = start; i <= end; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = days[date.getDay()];

            tempDates.push({
                id: dateStr,
                dayName,
                dayNumber: String(date.getDate()),
                fullDate: date
            });
        }
        return tempDates;
    }, []);

    // Initial load: Set Today
    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        setSelectedDate(todayStr);
    }, []);

    const handleSelect = (item: DateItem, index: number) => {
        setSelectedDate(item.id);
        onDateChange(item.id);

        // Scroll to center the selected item
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    };

    const getItemLayout = (_: any, index: number) => ({
        length: TOTAL_WIDTH,
        offset: TOTAL_WIDTH * index,
        index,
    });

    const renderItem = ({ item, index }: { item: DateItem, index: number }) => {
        const isActive = selectedDate === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.itemContainer,
                    isActive && { backgroundColor: Colors[theme].primary },
                    { backgroundColor: isActive ? Colors[theme].primary : Colors[theme].card }
                ]}
                onPress={() => handleSelect(item, index)}
                activeOpacity={0.7}
            >
                <ThemedText style={[styles.dayName, isActive && { color: '#fff' }]}>{item.dayName}</ThemedText>
                <ThemedText type="defaultSemiBold" style={[styles.dayNumber, isActive && { color: '#fff' }]}>{item.dayNumber}</ThemedText>
            </TouchableOpacity>
        );
    };

    // Index of Today (0 is -180, so 180 is 0 offset i.e. Today)
    const initialIndex = 180;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={datesData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                getItemLayout={getItemLayout}
                initialScrollIndex={initialIndex}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: ITEM_SPACING,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    dayName: {
        fontSize: 12,
        textTransform: 'uppercase',
        opacity: 0.6,
        marginBottom: 4,
    },
    dayNumber: {
        fontSize: 18,
    },
});
