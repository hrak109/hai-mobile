import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const ITEM_SIZE = width / COLUMN_COUNT;

type AppIcon = {
    id: string;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    route?: string;
    disabled?: boolean;
};

const APPS: AppIcon[] = [
    { id: 'chat', label: 'AI Chat', iconName: 'chatbubbles', color: '#4CAF50', route: '/chat' },
    { id: 'mail', label: 'Mail', iconName: 'mail', color: '#2196F3', disabled: true },
    { id: 'photos', label: 'Photos', iconName: 'images', color: '#FF9800', disabled: true },
    { id: 'settings', label: 'Settings', iconName: 'settings', color: '#9E9E9E', disabled: true },
    { id: 'maps', label: 'Maps', iconName: 'map', color: '#F44336', disabled: true },
    { id: 'weather', label: 'Weather', iconName: 'cloud', color: '#03A9F4', disabled: true },
    { id: 'calendar', label: 'Calendar', iconName: 'calendar', color: '#E91E63', disabled: true },
    { id: 'camera', label: 'Camera', iconName: 'camera', color: '#607D8B', disabled: true },
];

export default function HomeScreen() {
    const router = useRouter();
    const { signOut } = useSession();

    const handlePress = (app: AppIcon) => {
        if (app.disabled) return;
        if (app.route) {
            router.push(app.route as any);
        }
    };

    const renderItem = ({ item }: { item: AppIcon }) => (
        <View style={styles.appContainer}>
            <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: item.disabled ? '#ccc' : item.color }]}
                onPress={() => handlePress(item)}
                activeOpacity={item.disabled ? 1 : 0.7}
            >
                <Ionicons name={item.iconName} size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.appLabel}>{item.label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.time}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>

            <FlatList
                data={APPS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={COLUMN_COUNT}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
            />

            <View style={styles.dock}>
                <TouchableOpacity style={styles.dockIcon} onPress={() => signOut()}>
                    <Ionicons name="log-out-outline" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dockIcon}>
                    <Ionicons name="call" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dockIcon}>
                    <Ionicons name="globe" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dockIcon}>
                    <Ionicons name="musical-notes" size={28} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Deep black background often used in iOS mockups or wallpapers
    },
    header: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    time: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    grid: {
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    row: {
        justifyContent: 'flex-start',
    },
    appContainer: {
        width: ITEM_SIZE - 5, // Account for margins
        alignItems: 'center',
        marginBottom: 20,
    },
    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 14, // Squircle shape
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    appLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    dock: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glass morphism effect
        height: 90,
        borderRadius: 30,
        margin: 15,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 30,
    }
    ,
    dockIcon: {
        width: 55,
        height: 55,
        borderRadius: 12,
        backgroundColor: 'rgba(50, 200, 100, 0.8)', // Example dock color
        justifyContent: 'center',
        alignItems: 'center',
    }
});
