import React, { FC } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

// Extend TextInputProps to include custom props if needed
interface FormInputProps extends TextInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: TextInputProps['keyboardType'];
    multiline?: boolean;
}

const FormInput: FC<FormInputProps> = ({
    placeholder,
    value,
    onChangeText,
    keyboardType,
    multiline = false,
    ...props
}) => {
    return (
        <TextInput
            style={[
                styles.input,
                multiline && styles.multiline,
                props.style, // allow overriding styles
            ]}
            placeholder={placeholder}
            placeholderTextColor="#888"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            multiline={multiline}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    multiline: {
        textAlignVertical: 'top', // ensures text starts at the top in multiline
        paddingTop: 10,
    },
});

export default FormInput;
