import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardTypeOptions,
    GestureResponderEvent,
} from 'react-native';

interface CustomFormProps {
    label?: string;
    required?: boolean;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
    value?: string;
    onChangeText?: (text: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    options?: any; // For future use (e.g., dropdown)
    editable?: boolean;
    onValueChange?: (value: string) => void;
    onPress?: (event: GestureResponderEvent) => void;
    isModal?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
}

const CustomForm: React.FC<CustomFormProps> = ({
    label = '',
    required = false,
    placeholder,
    keyboardType = 'default',
    value,
    onChangeText,
    error,
    secureTextEntry = false,
    options = null,
    editable = true,
    onValueChange,
    onPress,
    isModal = false,
    multiline = false,
    numberOfLines = 1,
}) => {
    return (
        <View style={styles.container}>
            {label ? (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}>*</Text>}
                </Text>
            ) : null}

            {isModal ? (
                <TouchableOpacity
                    style={[styles.input, styles.modalInput, error && { borderColor: 'red' }]}
                    onPress={onPress}
                >
                    <Text style={{ color: value ? '#000' : '#aaa' }}>
                        {value || placeholder}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: editable ? '#fff' : '#f0f0f0',
                            color: editable ? '#000' : '#888',
                        },
                        error && { borderColor: 'red' },
                        multiline && styles.multilineInput,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor="#aaa"
                    keyboardType={keyboardType}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    editable={editable}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        color: '#333',
        marginBottom: 4,
    },
    required: {
        color: 'red',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    modalInput: {
        justifyContent: 'center',
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});

export default CustomForm;
