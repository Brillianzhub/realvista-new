import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

// Type definitions
interface Profile {
    avatar: string | { uri: string; type?: string; name?: string };
    phone_number: string;
    country_of_residence: string;
    state: string;
    city: string;
    street: string;
    house_number: string;
    postal_code: string;
    birth_date: string;
}

interface Errors {
    phone_number?: string;
    country_of_residence?: string;
    state?: string;
    city?: string;
    street?: string;
    birth_date?: string;
}

interface UserProfile {
    avatar?: string;
    phone_number?: string;
    country_of_residence?: string;
    state?: string;
    city?: string;
    street?: string;
    house_number?: string;
    postal_code?: string;
    birth_date?: string;
}

interface User {
    profile?: UserProfile;
}

interface GlobalContextType {
    user: User | null;
    reloadProfile: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    loading: boolean;
}


const ProfileForm: React.FC = () => {
    const { colors } = useTheme();
    const { user, reloadProfile, setLoading, loading } = useGlobalContext() as unknown as GlobalContextType;
    const [errors, setErrors] = useState<Errors>({});
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [date, setDate] = useState<Date>(new Date());

    const [profile, setProfile] = useState<Profile>({
        avatar: '',
        phone_number: '',
        country_of_residence: '',
        state: '',
        city: '',
        street: '',
        house_number: '',
        postal_code: '',
        birth_date: '',
    });

    useEffect(() => {
        if (user?.profile) {
            setProfile({
                avatar: user.profile.avatar ? { uri: user.profile.avatar } : '',
                phone_number: user.profile.phone_number || '',
                country_of_residence: user.profile.country_of_residence || '',
                state: user.profile.state || '',
                city: user.profile.city || '',
                street: user.profile.street || '',
                house_number: user.profile.house_number || '',
                postal_code: user.profile.postal_code || '',
                birth_date: user.profile.birth_date || '',
            });
        }
    }, [user]);

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!profile.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!/^\+\d{1,3}\d{6,}$/.test(profile.phone_number.trim())) {
            newErrors.phone_number = 'Ensure phone has the correct country code (e.g., +2340000000000)';
        }

        if (!profile.country_of_residence.trim()) newErrors.country_of_residence = 'Country is required';
        if (!profile.state.trim()) newErrors.state = 'State is required';
        if (!profile.city.trim()) newErrors.city = 'City is required';
        if (!profile.street.trim()) newErrors.street = 'Street is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const selectImage = async (): Promise<void> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const maxFileSize = 5 * 1024 * 1024;
            const selectedImage = result.assets
                .filter(asset => {
                    if ((asset.fileSize || 0) > maxFileSize) {
                        alert(`The image "${asset.fileName || 'selected'}" exceeds the 5MB size limit.`);
                        return false;
                    }
                    return true;
                })
                .map(asset => {
                    const uri = asset.uri;
                    const name = asset.fileName || `image_${Date.now()}.jpg`;

                    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
                    let type = 'image/jpeg';

                    if (['jpg', 'jpeg'].includes(extension)) type = 'image/jpeg';
                    else if (extension === 'png') type = 'image/png';
                    else if (extension === 'gif') type = 'image/gif';

                    return { uri, type, name };
                });

            if (selectedImage.length > 0) {
                setProfile({ ...profile, avatar: selectedImage[0] });
            } else {
                alert('No valid image selected.');
            }
        }
    };

    const handleInputChange = (field: keyof Profile, value: string): void => {
        setProfile({ ...profile, [field]: value });
    };

    const validateDateOfBirth = (selectedDate: Date | undefined): void => {
        const today = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 18);

        if (!selectedDate) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                birth_date: "Date of birth is required.",
            }));
            return;
        }

        if (selectedDate > minAgeDate) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                birth_date: "You must be at least 18 years old to register.",
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                birth_date: "",
            }));
            const formattedDate = selectedDate.toISOString().split("T")[0];
            setDate(selectedDate);
            handleInputChange("birth_date", formattedDate);
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) {
            const errorMessage = errors.phone_number
                ? errors.phone_number
                : 'Please fill in all required fields.';

            Alert.alert('Validation Error', errorMessage);
            return;
        }

        if (errors.birth_date) {
            Alert.alert("Validation Error", errors.birth_date);
            return;
        }

        setLoading(true);
        const formData = new FormData();

        if (typeof profile.avatar === 'object' && profile.avatar.uri && !profile.avatar.uri.startsWith("https")) {
            formData.append("avatar", {
                uri: profile.avatar.uri,
                name: profile.avatar.name || `avatar-${Date.now()}.jpg`,
                type: profile.avatar.type || 'image/jpeg',
            } as any);
        }

        formData.append("phone_number", profile.phone_number.trim());
        formData.append("country_of_residence", profile.country_of_residence.trim());
        formData.append("state", profile.state.trim());
        formData.append("city", profile.city.trim());
        formData.append("street", profile.street.trim());
        formData.append("house_number", profile.house_number.trim());
        formData.append("postal_code", profile.postal_code.trim());
        formData.append("birth_date", profile.birth_date.trim() || "");

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const response = await axios.put(
                'https://realvistamanagement.com/accounts/profile/create/',
                formData,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            Alert.alert('Success', 'Profile updated successfully!');
            await reloadProfile();
            router.back();
        } catch (error) {
            console.error('Profile update failed:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
                    {profile.avatar ? (
                        <Image
                            source={{ uri: typeof profile.avatar === 'string' ? profile.avatar : profile.avatar.uri }}
                            style={styles.avatar}
                        />
                    ) : (
                        <Text style={{ textAlign: 'center' }}>Select Profile Picture</Text>
                    )}
                </TouchableOpacity>
                <Text style={styles.label}>
                    Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.phone_number && { borderColor: 'red' },
                    ]}
                    placeholder="+2340000000000"
                    placeholderTextColor="#ccc"
                    keyboardType="phone-pad"
                    value={profile.phone_number}
                    onChangeText={(value) => handleInputChange('phone_number', value)}
                />
                {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number}</Text>}

                <Text style={styles.label}>
                    Country of Residence <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        errors.country_of_residence && { borderColor: 'red' },
                    ]}
                    placeholder="Country"
                    placeholderTextColor="#ccc"
                    value={profile.country_of_residence}
                    onChangeText={(value) => handleInputChange('country_of_residence', value)}
                />
                {errors.country_of_residence && (
                    <Text style={styles.errorText}>{errors.country_of_residence}</Text>
                )}
                <Text style={styles.label}>
                    State <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.state && { borderColor: 'red' }]}
                    placeholder="State"
                    placeholderTextColor="#ccc"
                    value={profile.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                />
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
                <Text style={styles.label}>
                    City <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.city && { borderColor: 'red' }]}
                    placeholder="City"
                    placeholderTextColor="#ccc"
                    value={profile.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                />
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

                <Text style={styles.label}>
                    Street <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, errors.street && { borderColor: 'red' }]}
                    placeholder="Street"
                    placeholderTextColor="#ccc"
                    value={profile.street}
                    onChangeText={(value) => handleInputChange('street', value)}
                />
                {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}

                <Text style={styles.label}>House Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter house number"
                    placeholderTextColor="#ccc"
                    value={profile.house_number}
                    onChangeText={(value) => handleInputChange('house_number', value)}
                />
                <Text style={styles.label}>Postal Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="00000"
                    placeholderTextColor="#ccc"
                    keyboardType="number-pad"
                    value={profile.postal_code}
                    onChangeText={(value) => handleInputChange('postal_code', value)}
                />
                <TouchableOpacity
                    style={[styles.dateButton]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateButtonText}>
                        {profile.birth_date ? `Date: ${profile.birth_date}` : 'Select Date of Birth'}
                    </Text>
                </TouchableOpacity>
                {errors.birth_date && (
                    <Text style={styles.errorText}>{errors.birth_date}</Text>
                )}
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            validateDateOfBirth(selectedDate);
                            if (selectedDate) {
                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                setDate(selectedDate);
                                handleInputChange('birth_date', formattedDate);
                            }
                        }}
                    />
                )}
                <TouchableOpacity onPress={handleSubmit} style={styles.button} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Profile'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20

    },
    contentContainer: {
        padding: 16,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#FB902E',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16
    },
    required: {
        color: 'red',
    },
    dateButton: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderRadius: 30,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateButtonText: {
        fontSize: 16,
        color: '#000',
    },
});

export default ProfileForm;
