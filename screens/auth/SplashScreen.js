import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <View style={styles.leaf} />
                    </View>
                    <Text style={styles.title}>CleanCity AI</Text>
                    <Text style={styles.subtitle}>Cleaner Cities. Smarter Living.</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.cityIllustration} />
                <Text style={styles.version}>V1.0.0</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.large,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    leaf: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    footer: {
        height: 200,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    cityIllustration: {
        width: '100%',
        height: 150,
        backgroundColor: '#E3F2FD',
        marginBottom: 16,
    },
    version: {
        color: COLORS.textSecondary,
        fontSize: 12,
    }
});

export default SplashScreen;
