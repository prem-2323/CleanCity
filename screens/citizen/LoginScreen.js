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
    Image,
    TextInput
} from 'react-native';
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

    const RoleButton = ({ title, subtitle, icon }) => (
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
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={{ fontSize: 24 }}>🍃</Text>
                            </View>
                            <Text style={styles.appName}>CleanCity</Text>
                        </View>
                        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                        <Text style={styles.welcomeSubtitle}>Citizen Login - Sign in to continue</Text>
                    </View>

                    {/* White Card Section */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Sign in as Citizen</Text>

                        {/* Form Section */}
                        <View style={styles.form}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputIcon}>✉️</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
                                <Text style={styles.signInButtonText}>Sign In</Text>
                                <Text style={styles.signInButtonIcon}>→</Text>
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.signUpText}>Sign Up</Text>
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
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.large,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    appName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
    },
    form: {
        marginTop: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        marginBottom: 20,
        height: 56,
    },
    inputIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    forgotPassword: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    signInButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    signInButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    signInButtonIcon: {
        color: COLORS.white,
        fontSize: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    signUpText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default LoginScreen;
