import React, { useState, FC } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Generic interface
interface PasswordInputProps<T extends Record<string, any>> extends TextInputProps {
    placeholder?: string;
    value: string;
    setForm: React.Dispatch<React.SetStateAction<T>>;
    form: T;
    type?: keyof T;
    validate?: boolean;
}

const PasswordInput = <T extends Record<string, any>>({
    placeholder,
    value,
    setForm,
    form,
    type = 'password' as keyof T,
    validate = false,
    ...props
}: PasswordInputProps<T>) => {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (text: string) => {
        setForm((prev) => ({
            ...prev,
            [type]: text,
        }));

        if (!validate) return;

        if (type === 'password') {
            validatePassword(text);
        } else if (type === 'confirmPassword') {
            validateConfirmPassword(text);
        }
    };

    const validatePassword = (text: string) => {
        if (text.length === 0) {
            setError('');
        } else if (text.length < 8) {
            setError('Password must be at least 8 characters long.');
        } else if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(text)) {
            setError(
                'Password must contain at least one special character (_ or - included).'
            );
        } else {
            setError('');
        }
    };

    const validateConfirmPassword = (text: string) => {
        if (text.length === 0) {
            setError('');
        } else if (text !== (form as any).password) {
            setError('Passwords do not match.');
        } else {
            setError('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputp}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={handleChange}
                    secureTextEntry={!showPassword}
                    {...props}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
                </Pressable>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    inputp: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    icon: {
        paddingLeft: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
    },
});

export default PasswordInput;