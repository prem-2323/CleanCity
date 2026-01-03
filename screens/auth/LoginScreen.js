import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const LoginScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Citizen');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (activeTab === 'Citizen') {
            navigation.replace('CitizenHome');
        } else if (activeTab === 'Cleaner') {
            navigation.replace('CleanerHome');
        } else if (activeTab === 'Admin') {
            navigation.replace('AdminHome');
        }
    };

    const RoleButton = ({ title, subtitle }) => (
        <TouchableOpacity
            style={[
                styles.roleButton,
                activeTab === title && styles.activeRoleButton
            ]}
            onPress={() => setActiveTab(title)}
        >
            <Text style={[styles.roleTitle, activeTab === title && styles.activeRoleText]}>{title}</Text>
            <Text style={[styles.roleSubtitle, activeTab === title && styles.activeRoleText]}>{subtitle}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Brand Header */}
                    <View style={styles.header}>
                        <View style={styles.logoBox}>
                            <Ionicons name="leaf" size={50} color="#FFF" />
                        </View>
                        <Text style={styles.appTitle}>CleanCity AI</Text>
                        <Text style={styles.appSlogan}>Cleaner Cities. Smarter Living.</Text>
                    </View>

                    {/* Login Card */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Select your role</Text>
                        <View style={styles.roleContainer}>
                            <RoleButton
                                title="Citizen"
                                subtitle="Report View"
                            />
                            <RoleButton
                                title="Cleaner"
                                subtitle="Field View"
                            />
                            <RoleButton
                                title="Admin"
                                subtitle="Control View"
                            />
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#94A3B8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                                <Text style={styles.signInButtonText}>Log In</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>New to CleanCity? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.signUpText}>Create Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4', // Light green background matching the brand
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBox: {
        width: 100,
        height: 100,
        borderRadius: 28,
        backgroundColor: '#10B981', // Brand Green
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        // Leaf shape styling trick:
        borderTopLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#064E3B',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    appSlogan: {
        fontSize: 16,
        color: '#059669',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.05,
        shadowRadius: 30,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    roleButton: {
        width: '31%',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },
    activeRoleButton: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
        borderWidth: 2,
    },
    roleTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 4,
    },
    roleSubtitle: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
    },
    activeRoleText: {
        color: '#059669',
    },
    form: {
        marginTop: 0,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        marginBottom: 20,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '500',
    },
    signInButton: {
        backgroundColor: '#10B981',
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        marginTop: 8,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    signInButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#64748B',
        fontSize: 14,
    },
    signUpText: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default LoginScreen;
