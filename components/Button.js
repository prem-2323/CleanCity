import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Button = ({ title, onPress, variant = 'primary', loading = false, style, textStyle }) => {
    const backgroundColor = variant === 'primary' ? COLORS.primary : COLORS.white;
    const textColor = variant === 'primary' ? COLORS.white : COLORS.primary;
    const borderStyle = variant === 'outline' ? { borderWidth: 1, borderColor: COLORS.primary } : {};

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor }, borderStyle, style]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: 12, // Rounded corners as per design
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.medium,
        marginVertical: SIZES.base,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    text: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
    },
});

export default Button;
