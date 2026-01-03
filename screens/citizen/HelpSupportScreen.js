import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const HelpSupportScreen = ({ navigation }) => {
    const FAQItem = ({ question }) => (
        <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{question}</Text>
            <Ionicons name="chevron-down" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    const ContactCard = ({ icon, label, subLabel, color }) => (
        <TouchableOpacity style={styles.contactCard}>
            <View style={[styles.contactIconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={styles.contactSubLabel}>{subLabel}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.searchSection}>
                    <Text style={styles.title}>How can we help you?</Text>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="Search help topics..."
                            style={styles.searchInput}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Quick Contact</Text>
                <ContactCard
                    icon="chatbubble-ellipses-outline"
                    label="Live Chat"
                    subLabel="Typical response 2-3 mins"
                    color="#3B82F6"
                />
                <ContactCard
                    icon="mail-outline"
                    label="Email Support"
                    subLabel="help@cleancity.ai"
                    color="#10B981"
                />
                <ContactCard
                    icon="call-outline"
                    label="Help Center"
                    subLabel="1800-CLEAN-CITY"
                    color="#F59E0B"
                />

                <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
                <View style={styles.faqList}>
                    <FAQItem question="How do my eco points get calculated?" />
                    <View style={styles.divider} />
                    <FAQItem question="What qualifies as 'Hazardous' waste?" />
                    <View style={styles.divider} />
                    <FAQItem question="How long does a cleanup take?" />
                    <View style={styles.divider} />
                    <FAQItem question="Can I report anonymously?" />
                </View>

                <TouchableOpacity style={styles.reportBugBtn}>
                    <Ionicons name="bug-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                    <Text style={styles.reportBugText}>Report an app issue</Text>
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        padding: 24,
    },
    searchSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 20,
        textAlign: 'center',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        marginTop: 8,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    contactIconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    contactSubLabel: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    faqList: {
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 8,
        marginBottom: 24,
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    faqQuestion: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16,
    },
    reportBugBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 10,
    },
    reportBugText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    }
});

export default HelpSupportScreen;
