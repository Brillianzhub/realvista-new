import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ListRenderItem,
} from 'react-native';
import useUserProperty from '@/hooks/portfolio/useUserProperty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Property {
    id: number;
    title: string;
    group_owner_name: string | null;
}


const RemoveGroupProperty: React.FC = () => {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const { properties, fetchUserProperties, setLoading, loading } = useUserProperty();
    const router = useRouter();

    const confirmDeleteProperty = () => {
        if (!selectedProperty) {
            Alert.alert('Error', 'Please select a property to delete.');
            return;
        }

        Alert.alert(
            'Confirm Deletion',
            `Are you sure you want to delete the property "${selectedProperty.title}"? 
            \nThis action is irreversible, and all data associated with this property will be permanently lost.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: handleDeleteProperty },
            ],
            { cancelable: true }
        );
    };

    const handleDeleteProperty = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            Alert.alert('Error', 'User token required to complete this operation');
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(
                `https://www.realvistamanagement.com/portfolio/delete-property/${selectedProperty?.id}/`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                }
            );
            if (response.ok) {
                Alert.alert('Success', 'Property has been deleted successfully.');
                setSelectedProperty(null);
                fetchUserProperties();
                router.replace({
                    pathname: "/(app)/(manage)/manage"
                });
            } else {
                const error = await response.json();
                Alert.alert('Error', error.error || 'Failed to delete property.');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const renderProperty: ListRenderItem<Property> = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.propertyItem,
                selectedProperty?.id === item.id && styles.selectedProperty,
            ]}
            onPress={() => setSelectedProperty(item)}
        >
            <Text style={styles.propertyText}>{item.title}</Text>
        </TouchableOpacity>
    );

    const filteredProperties = properties.filter(
        (property) => property.group_owner_name === null
    );


    // const filteredProperties = properties.filter(
    //     (property: Property) => property.group_owner_name === null
    // );

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Select the property you wish to remove.</Text>
                {loading && <ActivityIndicator size="large" color="#358B8B" />}
                <FlatList
                    data={filteredProperties}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProperty}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
                <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteProperty}>
                    <Text style={styles.deleteButtonText}>Delete Selected Property</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RemoveGroupProperty;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 20,
        fontWeight: '400',
        marginBottom: 20,
        textAlign: 'left',
    },
    listContainer: {
        paddingBottom: 20,
    },
    propertyItem: {
        padding: 15,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
    },
    selectedProperty: {
        borderColor: '#358B8B',
    },
    propertyText: {
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#FB902E',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteButtonText: {
        color: '#ffffff',
        fontWeight: '400',
        fontSize: 16,
    },
});