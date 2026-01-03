import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const NewReportScreen = ({ navigation }) => {
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiAutofill = () => {
        setIsAiLoading(true);
        // Simulate AI processing
        setTimeout(() => {
            setLocation('123, MG Road, Sector 5, Gurugram, Haryana - 122001'); // Example AI result
            setIsAiLoading(false);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Report Waste</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Upload Section */}
                    <Text style={styles.sectionTitle}>Upload Evidence</Text>
                    <TouchableOpacity style={styles.uploadCard}>
                        <View style={styles.uploadIconCircle}>
                            <Ionicons name="camera" size={32} color={COLORS.white} />
                        </View>
                        <Text style={styles.uploadTitle}>Take a photo or upload</Text>
                        <Text style={styles.uploadSubtitle}>Capture the waste location clearly</Text>
                    </TouchableOpacity>

                    {/* Location Card */}
                    <Text style={styles.sectionTitle}>Location Details</Text>
                    <View style={styles.locationCard}>
                        <View style={styles.locationIconBox}>
                            <Ionicons name="location" size={24} color="#059669" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16, marginRight: 8 }}>
                            <TextInput
                                style={styles.locationInput}
                                placeholder="Enter location details..."
                                placeholderTextColor="#94A3B8"
                                value={location}
                                onChangeText={setLocation}
                                multiline
                            />
                            <Text style={styles.locationHint}>Editing location is optional</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.aiButton}
                            onPress={handleAiAutofill}
                            disabled={isAiLoading}
                        >
                            {isAiLoading ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                                    <Text style={styles.aiButtonText}>AI Fill</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Description Input */}
                    <Text style={styles.sectionTitle}>Description (Optional)</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Add details about the waste (e.g., Plastic bottles, hazardous materials...)"
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* Photo Tips Section */}
                    <View style={styles.tipsCard}>
                        <View style={styles.tipsHeader}>
                            <Ionicons name="bulb" size={20} color="#D97706" style={{ marginRight: 8 }} />
                            <Text style={styles.tipsTitle}>Photography Tips</Text>
                        </View>
                        <View style={styles.tipRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            <Text style={styles.tipText}>Include the surroundings for context</Text>
                        </View>
                        <View style={styles.tipRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            <Text style={styles.tipText}>Capture from multiple angles</Text>
                        </View>
                        <View style={styles.tipRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            <Text style={styles.tipText}>Ensure the image is clear and bright</Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => navigation.replace('CitizenHome')}
                    >
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
        backgroundColor: COLORS.white,
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
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
        marginTop: 8,
    },
    uploadCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    uploadIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    uploadSubtitle: {
        fontSize: 13,
        color: '#64748B',
    },
    locationCard: {
        flexDirection: 'row',
        backgroundColor: '#ECFDF5',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    locationIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#064E3B',
    },
    locationText: {
        fontSize: 13,
        color: '#06503C',
        opacity: 0.7,
    },
    editLocationBtn: {
        padding: 8,
    },
    inputContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    textInput: {
        fontSize: 15,
        color: '#1E293B',
        textAlignVertical: 'top',
        minHeight: 100,
    },
    tipsCard: {
        backgroundColor: '#FFFBEB',
        padding: 20,
        borderRadius: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#92400E',
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#92400E',
        marginLeft: 8,
        flex: 1,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    locationInput: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#064E3B',
        padding: 0,
    },
    locationHint: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    aiButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
    }
});

export default NewReportScreen;
