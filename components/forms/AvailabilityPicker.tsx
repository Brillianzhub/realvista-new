import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type AvailabilityPickerProps = {
  formData: {
    availability: string;
    availability_date: string;
  };
  handleInputChange: (field: string, value: any) => void;
  errors: { [key: string]: string };
};

export default function AvailabilityPicker({
  formData,
  handleInputChange,
  errors,
}: AvailabilityPickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('availability_date', selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        Availability <Text style={styles.required}>*</Text>
      </Text>

      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={[
            styles.radioButton,
            formData.availability === 'now' && styles.selectedRadioButton,
            isDark && styles.radioButtonDark,
          ]}
          onPress={() => {
            handleInputChange('availability', 'now');
            handleInputChange('availability_date', '');
          }}
        >
          <View
            style={[
              styles.dot,
              formData.availability === 'now' && styles.selectedDot,
            ]}
          />
          <Text
            style={[
              styles.radioButtonText,
              formData.availability === 'now' && styles.selectedRadioButtonText,
              isDark && styles.radioButtonTextDark,
            ]}
          >
            Available Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.radioButton,
            formData.availability === 'specific_date' && styles.selectedRadioButton,
            isDark && styles.radioButtonDark,
          ]}
          onPress={() => handleInputChange('availability', 'specific_date')}
        >
          <View
            style={[
              styles.dot,
              formData.availability === 'specific_date' && styles.selectedDot,
            ]}
          />
          <Text
            style={[
              styles.radioButtonText,
              formData.availability === 'specific_date' &&
                styles.selectedRadioButtonText,
              isDark && styles.radioButtonTextDark,
            ]}
          >
            Available From
          </Text>
        </TouchableOpacity>
      </View>

      {formData.availability === 'specific_date' && (
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            style={[
              styles.dateButton,
              isDark && styles.dateButtonDark,
              errors.availability_date && styles.dateButtonError,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.dateButtonText,
                isDark && styles.dateButtonTextDark,
                !formData.availability_date && styles.placeholderText,
              ]}
            >
              {formData.availability_date || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={
                formData.availability_date
                  ? new Date(formData.availability_date)
                  : new Date()
              }
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>
      )}

      {errors.availability && (
        <Text style={styles.errorText}>{errors.availability}</Text>
      )}
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
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  radioButtonDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  selectedRadioButton: {
    borderColor: '#FB902E',
    backgroundColor: '#FFF7ED',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    borderColor: '#FB902E',
    backgroundColor: '#FB902E',
  },
  radioButtonText: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
  },
  radioButtonTextDark: {
    color: '#9CA3AF',
  },
  selectedRadioButtonText: {
    color: '#FB902E',
    fontWeight: '600',
  },
  datePickerContainer: {
    marginTop: 8,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  dateButtonError: {
    borderColor: '#EF4444',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  dateButtonTextDark: {
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
