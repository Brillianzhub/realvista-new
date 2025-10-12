import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CustomFormProps = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
  isModal?: boolean;
  onPress?: () => void;
};

export default function CustomForm({
  label,
  required = false,
  error,
  isModal = false,
  onPress,
  ...textInputProps
}: CustomFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isModal) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, isDark && styles.labelDark]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.modalInput,
            isDark && styles.inputDark,
            error && styles.inputError,
          ]}
          onPress={onPress}
        >
          <Text
            style={[
              styles.modalInputText,
              isDark && styles.modalInputTextDark,
              !textInputProps.value && styles.placeholderText,
            ]}
          >
            {textInputProps.value || textInputProps.placeholder}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark,
          error && styles.inputError,
          textInputProps.multiline && styles.textArea,
        ]}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        {...textInputProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#E5E7EB',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
    color: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalInputText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  modalInputTextDark: {
    color: '#F9FAFB',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
