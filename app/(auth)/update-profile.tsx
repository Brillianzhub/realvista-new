import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
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

            if (user.profile.birth_date) {
                setDate(new Date(user.profile.birth_date));
            }
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
            Alert.alert('Permission Required', 'Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            const maxFileSize = 5 * 1024 * 1024;
            const selectedImage = result.assets
                .filter((asset) => {
                    if ((asset.fileSize || 0) > maxFileSize) {
                        Alert.alert('File Too Large', `The image exceeds the 5MB size limit.`);
                        return false;
                    }
                    return true;
                })
                .map((asset) => {
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
                Alert.alert('Invalid Image', 'No valid image selected.');
            }
        }
    };

    const handleInputChange = (field: keyof Profile, value: string): void => {
        setProfile({ ...profile, [field]: value });
        if (errors[field as keyof Errors]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const validateDateOfBirth = (selectedDate: Date | undefined): void => {
        const today = new Date();
        const minAgeDate = new Date();
        minAgeDate.setFullYear(today.getFullYear() - 18);

        if (!selectedDate) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                birth_date: 'Date of birth is required.',
            }));
            return;
        }

        if (selectedDate > minAgeDate) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                birth_date: 'You must be at least 18 years old to register.',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                birth_date: '',
            }));
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDate(selectedDate);
            handleInputChange('birth_date', formattedDate);
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) {
            const errorMessage = errors.phone_number ? errors.phone_number : 'Please fill in all required fields.';
            Alert.alert('Validation Error', errorMessage);
            return;
        }

        if (errors.birth_date) {
            Alert.alert('Validation Error', errors.birth_date);
            return;
        }

        setLoading(true);
        const formData = new FormData();

        if (typeof profile.avatar === 'object' && profile.avatar.uri && !profile.avatar.uri.startsWith('https')) {
            formData.append('avatar', {
                uri: profile.avatar.uri,
                name: profile.avatar.name || `avatar-${Date.now()}.jpg`,
                type: profile.avatar.type || 'image/jpeg',
            } as any);
        }

        formData.append('phone_number', profile.phone_number.trim());
        formData.append('country_of_residence', profile.country_of_residence.trim());
        formData.append('state', profile.state.trim());
        formData.append('city', profile.city.trim());
        formData.append('street', profile.street.trim());
        formData.append('house_number', profile.house_number.trim());
        formData.append('postal_code', profile.postal_code.trim());
        formData.append('birth_date', profile.birth_date.trim() || '');

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            const response = await fetch('https://realvistamanagement.com/accounts/profile/create/', {
                method: 'PUT',
                headers: {
                    Authorization: `Token ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Success', 'Profile updated successfully!');
                await reloadProfile();
                router.replace('/(profile)');
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label: string,
        field: keyof Profile,
        placeholder: string,
        required: boolean = false,
        keyboardType: any = 'default',
        icon: any = 'create-outline'
    ) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[styles.inputContainer, isDark && styles.inputContainerDark, errors[field as keyof Errors] && styles.inputError]}>
                <Ionicons name={icon} size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    keyboardType={keyboardType}
                    value={profile[field] as string}
                    onChangeText={(value) => handleInputChange(field, value)}
                />
            </View>
            {errors[field as keyof Errors] && <Text style={styles.errorText}>{errors[field as keyof Errors]}</Text>}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, isDark && styles.containerDark]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <LinearGradient colors={isDark ? ['#111827', '#1F2937'] : ['#F9FAFB', '#FFFFFF']} style={styles.gradient}>


                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={selectImage} style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
                            {profile.avatar ? (
                                <Image
                                    source={{ uri: typeof profile.avatar === 'string' ? profile.avatar : profile.avatar.uri }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={60} color={isDark ? '#4B5563' : '#D1D5DB'} />
                                </View>
                            )}
                            <View style={[styles.editBadge, isDark && styles.editBadgeDark]}>
                                <Ionicons name="camera" size={16} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.avatarHint, isDark && styles.avatarHintDark]}>Tap to change profile picture</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="call" size={20} color="#358B8B" />
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Contact Information</Text>
                            </View>
                            {renderInput('Phone Number', 'phone_number', '+2340000000000', true, 'phone-pad', 'call-outline')}
                        </View>

                        <View style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="location" size={20} color="#358B8B" />
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Address Details</Text>
                            </View>
                            {renderInput('Country of Residence', 'country_of_residence', 'e.g., Nigeria', true, 'default', 'globe-outline')}
                            {renderInput('State', 'state', 'e.g., Lagos', true, 'default', 'location-outline')}
                            {renderInput('City', 'city', 'e.g., Ikeja', true, 'default', 'business-outline')}
                            {renderInput('Street', 'street', 'e.g., Allen Avenue', true, 'default', 'trail-sign-outline')}
                            {renderInput('House Number', 'house_number', 'e.g., 45', false, 'default', 'home-outline')}
                            {renderInput('Postal Code', 'postal_code', 'e.g., 100001', false, 'number-pad', 'mail-outline')}
                        </View>

                        <View style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="calendar" size={20} color="#358B8B" />
                                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Personal Information</Text>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isDark && styles.labelDark]}>Date of Birth</Text>
                                <TouchableOpacity
                                    style={[styles.dateButton, isDark && styles.dateButtonDark, errors.birth_date && styles.inputError]}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                    <Text style={[styles.dateButtonText, isDark && styles.dateButtonTextDark]}>
                                        {profile.birth_date ? profile.birth_date : 'Select Date of Birth'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                                </TouchableOpacity>
                                {errors.birth_date && <Text style={styles.errorText}>{errors.birth_date}</Text>}
                            </View>
                        </View>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                validateDateOfBirth(selectedDate);
                            }}
                            maximumDate={new Date()}
                        />
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.submitButton, isDark && styles.submitButtonDark]}
                        disabled={loading}
                    >
                        <LinearGradient colors={['#358B8B', '#2C7070']} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Update Profile</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    gradient: {
        flex: 1,
    },
    // header: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     paddingHorizontal: 16,
    //     paddingTop: 20,
    //     paddingBottom: 16,
    // },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButtonDark: {
        backgroundColor: '#1F2937',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    headerTitleDark: {
        color: '#F9FAFB',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    avatarContainer: {
        position: 'relative',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainerDark: {
        backgroundColor: '#1F2937',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#358B8B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    editBadgeDark: {
        borderColor: '#111827',
    },
    avatarHint: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    avatarHintDark: {
        color: '#9CA3AF',
    },
    formSection: {
        gap: 16,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionCardDark: {
        backgroundColor: '#1F2937',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    sectionTitleDark: {
        color: '#F9FAFB',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    labelDark: {
        color: '#D1D5DB',
    },
    required: {
        color: '#EF4444',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
    },
    inputContainerDark: {
        backgroundColor: '#111827',
        borderColor: '#374151',
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#111827',
    },
    inputDark: {
        color: '#F9FAFB',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        height: 48,
        gap: 8,
    },
    dateButtonDark: {
        backgroundColor: '#111827',
        borderColor: '#374151',
    },
    dateButtonText: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    dateButtonTextDark: {
        color: '#F9FAFB',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    submitButton: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#358B8B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDark: {
        shadowOpacity: 0.5,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default ProfileForm;
