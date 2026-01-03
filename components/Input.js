import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Input = ({ label, placeholder, value, onChangeText, secureTextEntry, rightIcon, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    {...props}
                />
                {rightIcon}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SIZES.base,
    },
    label: {
        fontSize: SIZES.font,
        color: COLORS.text,
        marginBottom: 6,
        fontWeight: '600',
    },
    inputContainer: {
        height: 50,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.medium,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: SIZES.medium,
    },
});

export default Input;
