import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const LanguageScreen = ({ navigation }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languages = [
        { id: '1', name: 'English', native: 'English', icon: '🇺🇸' },
        { id: '2', name: 'Tamil', native: 'தமிழ்', icon: '🇮🇳' },
        { id: '3', name: 'Hindi', native: 'हिन्दी', icon: '🇮🇳' },
        { id: '4', name: 'Spanish', native: 'Español', icon: '🇪🇸' },
        { id: '5', name: 'French', native: 'Français', icon: '🇫🇷' },
        { id: '6', name: 'German', native: 'Deutsch', icon: '🇩🇪' },
    ];

    const LanguageItem = ({ item }) => {
        const isSelected = selectedLanguage === item.name;
        return (
            <TouchableOpacity
                style={[styles.langItem, isSelected && styles.selectedLangItem]}
                onPress={() => setSelectedLanguage(item.name)}
            >
                <View style={styles.langLeft}>
                    <Text style={styles.langIcon}>{item.icon}</Text>
                    <View style={{ marginLeft: 16 }}>
                        <Text style={[styles.langName, isSelected && styles.selectedLangText]}>{item.name}</Text>
                        <Text style={styles.langNative}>{item.native}</Text>
                    </View>
                </View>
                {isSelected && (
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Language</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Choose your preferred language</Text>
                <Text style={styles.subtitle}>Select the language you want to use within the app.</Text>

                <FlatList
                    data={languages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <LanguageItem item={item} />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />

                <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.confirmBtnText}>Confirm Language</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 32,
    },
    listContainer: {
        paddingBottom: 20,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    selectedLangItem: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    langLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    langIcon: {
        fontSize: 24,
    },
    langName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    selectedLangText: {
        color: COLORS.primary,
    },
    langNative: {
        fontSize: 12,
        color: '#64748B',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    confirmBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default LanguageScreen;
