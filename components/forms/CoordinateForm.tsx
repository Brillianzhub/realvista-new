import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Modal,
    TextInput,
    useColorScheme,
    Platform,
    FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Property {
    id: string;
    title: string;
}

interface Coordinate {
    latitude?: number;
    longitude?: number;
    utm_x?: number;
    utm_y?: number;
    utm_zone?: number;
}

interface CoordinateFormProps {
    onSubmit?: (payload: any) => void;
}

const CoordinateForm: React.FC<CoordinateFormProps> = ({ onSubmit }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showPropertyPicker, setShowPropertyPicker] = useState(false);
    const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
    const [utmX, setUtmX] = useState('');
    const [utmY, setUtmY] = useState('');
    const [utmZone, setUtmZone] = useState('32');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUTMInput, setIsUTMInput] = useState(true);

    // useEffect(() => {
    //     fetchProperties();
    // }, []);

    // const fetchProperties = async () => {
    //     try {
    //         const { data, error } = await supabase
    //             .from('properties')
    //             .select('id, title')
    //             .order('created_at', { ascending: false });

    //         if (error) throw error;
    //         setProperties(data || []);
    //     } catch (error) {
    //         console.error('Error fetching properties:', error);
    //     }
    // };

    const handlePickCoordinates = async () => {
        setIsFetchingLocation(true);

        if (Platform.OS !== 'web') {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsFetchingLocation(false);
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to fetch coordinates.'
                );
                return;
            }
        }

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const { latitude: lat, longitude: lng } = location.coords;

            setCoordinate({ latitude: lat, longitude: lng });
            setLatitude(lat.toFixed(6));
            setLongitude(lng.toFixed(6));

            Alert.alert('Success', 'Coordinates fetched successfully!');
        } catch (error) {
            console.error('Location fetching error:', error);
            Alert.alert('Error', 'Could not get location. Please try again.');
        } finally {
            setIsFetchingLocation(false);
        }
    };

    const addCoordinate = () => {
        if (isUTMInput) {
            if (!utmX || !utmY) {
                Alert.alert('Error', 'Please fill in both UTM X and UTM Y fields.');
                return;
            }

            const newCoordinate = {
                utm_x: parseFloat(utmX),
                utm_y: parseFloat(utmY),
                utm_zone: parseInt(utmZone, 10),
            };

            if (
                isNaN(newCoordinate.utm_x) ||
                isNaN(newCoordinate.utm_y) ||
                isNaN(newCoordinate.utm_zone)
            ) {
                Alert.alert(
                    'Error',
                    'Invalid UTM coordinate values. Please check your input.'
                );
                return;
            }

            setCoordinate(newCoordinate);
            Alert.alert('Success', 'Coordinate added successfully!');
        } else {
            if (!latitude || !longitude) {
                Alert.alert('Error', 'Please fill in both Latitude and Longitude fields.');
                return;
            }

            const newCoordinate = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            };

            if (isNaN(newCoordinate.latitude) || isNaN(newCoordinate.longitude)) {
                Alert.alert(
                    'Error',
                    'Invalid WGS84 coordinate values. Please check your input.'
                );
                return;
            }

            setCoordinate(newCoordinate);
            Alert.alert('Success', 'Coordinate added successfully!');
        }
    };

    const clearCoordinate = () => {
        setCoordinate(null);
        setUtmX('');
        setUtmY('');
        setUtmZone('32');
        setLatitude('');
        setLongitude('');
    };

    const handleSubmit = async () => {
        if (!selectedPropertyId) {
            Alert.alert('Error', 'Please select a property before submitting coordinates.');
            return;
        }

        if (!coordinate) {
            Alert.alert('Error', 'Please add a coordinate.');
            return;
        }

        const roundedCoordinate =
            coordinate.latitude !== undefined && coordinate.longitude !== undefined
                ? {
                    ...coordinate,
                    latitude: parseFloat(coordinate.latitude.toFixed(6)),
                    longitude: parseFloat(coordinate.longitude.toFixed(6)),
                }
                : coordinate;

        const payload = {
            property: selectedPropertyId,
            coordinates: [roundedCoordinate],
        };

        setIsSubmitting(true);

        try {

            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                Alert.alert(
                    'Authentication Required',
                    'Authentication token is missing. Please log in again.'
                );
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(
                'https://realvistamanagement.com/portfolio/property/coordinates/',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Something went wrong. Please try again.');
            }

            Alert.alert('Success', 'Coordinates saved successfully!');
            clearCoordinate();
            if (onSubmit) onSubmit(payload);
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleModal = () => setIsModalVisible(!isModalVisible);
    const toggleInputType = () => {
        setIsUTMInput(!isUTMInput);
        clearCoordinate();
    };

    const getSelectedPropertyTitle = () => {
        const property = properties.find((p) => p.id === selectedPropertyId);
        return property ? property.title : 'Select a property';
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
            <TouchableOpacity style={styles.questionIconContainer} onPress={toggleModal}>
                <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color="#358B8B"
                    style={styles.questionIcon}
                />
            </TouchableOpacity>

            <View style={styles.formGroup}>
                <Text style={[styles.label, isDark && styles.labelDark]}>
                    Select Property <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                    style={[styles.pickerButton, isDark && styles.pickerButtonDark]}
                    onPress={() => setShowPropertyPicker(!showPropertyPicker)}
                >
                    <Text
                        style={[
                            styles.pickerButtonText,
                            isDark && styles.pickerButtonTextDark,
                            !selectedPropertyId && styles.placeholderText,
                        ]}
                    >
                        {getSelectedPropertyTitle()}
                    </Text>
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                </TouchableOpacity>
                {showPropertyPicker && (
                    <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
                        <FlatList
                            data={properties}
                            keyExtractor={(item) => item.id}
                            style={styles.pickerScroll}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setSelectedPropertyId(item.id);
                                        setShowPropertyPicker(false);
                                    }}
                                >
                                    <Text
                                        style={[styles.pickerOptionText, isDark && styles.pickerOptionTextDark]}
                                    >
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleInputType}>
                <Text style={styles.toggleButtonText}>
                    {isUTMInput
                        ? 'Switch to WGS84 (Latitude/Longitude)'
                        : 'Switch to UTM Coordinates'}
                </Text>
            </TouchableOpacity>

            {isUTMInput ? (
                <>
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>
                            UTM X (Easting mE) <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="Enter UTM X (Easting mE)"
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            keyboardType="numeric"
                            value={utmX}
                            onChangeText={setUtmX}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>
                            UTM Y (Northing mN) <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="Enter UTM Y (Northing mN)"
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            keyboardType="numeric"
                            value={utmY}
                            onChangeText={setUtmY}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>
                            UTM Zone <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="Enter UTM Zone (Default: 32)"
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            keyboardType="numeric"
                            value={utmZone}
                            onChangeText={setUtmZone}
                        />
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>
                            Latitude <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="Enter Latitude e.g. 5.496648"
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            keyboardType="numeric"
                            value={latitude}
                            onChangeText={setLatitude}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, isDark && styles.labelDark]}>
                            Longitude <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, isDark && styles.inputDark]}
                            placeholder="Enter Longitude e.g. 7.525206"
                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                            keyboardType="numeric"
                            value={longitude}
                            onChangeText={setLongitude}
                        />
                    </View>
                </>
            )}

            <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={addCoordinate}
            >
                <Ionicons name="add-circle-outline" size={20} color="#111827" />
                <Text style={styles.addButtonText}>Add Coordinate</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handlePickCoordinates}
                disabled={isFetchingLocation}
            >
                {isFetchingLocation ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Ionicons name="location" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Pick Coordinates (WGS84)</Text>
                    </>
                )}
            </TouchableOpacity>

            {coordinate && (
                <View style={[styles.coordinateCard, isDark && styles.coordinateCardDark]}>
                    <View style={styles.coordinateHeader}>
                        <Text style={[styles.coordinateTitle, isDark && styles.coordinateTitleDark]}>
                            Current Coordinate
                        </Text>
                        <TouchableOpacity onPress={clearCoordinate}>
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.coordinateDetails}>
                        {coordinate.latitude !== undefined && coordinate.longitude !== undefined ? (
                            <>
                                <Text style={[styles.coordinateText, isDark && styles.coordinateTextDark]}>
                                    Latitude: {coordinate.latitude.toFixed(6)}
                                </Text>
                                <Text style={[styles.coordinateText, isDark && styles.coordinateTextDark]}>
                                    Longitude: {coordinate.longitude.toFixed(6)}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.coordinateText, isDark && styles.coordinateTextDark]}>
                                    UTM X: {coordinate.utm_x}
                                </Text>
                                <Text style={[styles.coordinateText, isDark && styles.coordinateTextDark]}>
                                    UTM Y: {coordinate.utm_y}
                                </Text>
                                <Text style={[styles.coordinateText, isDark && styles.coordinateTextDark]}>
                                    Zone: {coordinate.utm_zone}
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.submitButton,
                    (isSubmitting || !coordinate || !selectedPropertyId) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || !coordinate || !selectedPropertyId}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Submit Coordinate</Text>
                    </>
                )}
            </TouchableOpacity>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={toggleModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="information-circle" size={32} color="#358B8B" />
                        </View>
                        <Text style={[styles.modalText, isDark && styles.modalTextDark]}>
                            To locate the property on Google Maps, please provide one coordinate using
                            either the UTM or WGS84 method. Please ensure the coordinate is accurate to
                            minimize errors in property location.
                        </Text>
                        <TouchableOpacity style={styles.closeModalButton} onPress={toggleModal}>
                            <Text style={styles.closeModalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default CoordinateForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    questionIconContainer: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    questionIcon: {
        padding: 4,
    },
    formGroup: {
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
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    inputDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        color: '#F9FAFB',
    },
    pickerButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerButtonTextDark: {
        color: '#F9FAFB',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    pickerContainerDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    pickerScroll: {
        maxHeight: 200,
    },
    pickerOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerOptionTextDark: {
        color: '#F9FAFB',
    },
    toggleButton: {
        backgroundColor: '#358B8B',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#E9E9E9',
    },
    addButtonText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#358B8B',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    coordinateCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    coordinateCardDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    coordinateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    coordinateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    coordinateTitleDark: {
        color: '#F9FAFB',
    },
    coordinateDetails: {
        gap: 6,
    },
    coordinateText: {
        fontSize: 14,
        color: '#374151',
    },
    coordinateTextDark: {
        color: '#E5E7EB',
    },
    submitButton: {
        backgroundColor: '#FB902E',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalContentDark: {
        backgroundColor: '#1F2937',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    modalText: {
        fontSize: 15,
        color: '#374151',
        textAlign: 'justify',
        lineHeight: 22,
        marginBottom: 20,
    },
    modalTextDark: {
        color: '#E5E7EB',
    },
    closeModalButton: {
        backgroundColor: '#358B8B',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
