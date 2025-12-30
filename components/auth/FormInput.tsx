import React, { FC } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

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

    const { colors } = useTheme();

    const styles = StyleSheet.create({
        input: {
            height: 50,
            borderWidth: 1,
            borderColor: colors.border.default,
            borderRadius: 15,
            paddingHorizontal: 10,
            marginBottom: 15,
            fontSize: 16,
            backgroundColor: colors.background.secondary,
            color: colors.text.primary,
        },
        multiline: {
            textAlignVertical: 'top', 
            paddingTop: 10,
        },
    });

    return (
        <TextInput
            style={[
                styles.input,
                multiline && styles.multiline,
                props.style, // allow overriding styles
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.text.muted}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            multiline={multiline}
            {...props}
        />
    );
};



export default FormInput;