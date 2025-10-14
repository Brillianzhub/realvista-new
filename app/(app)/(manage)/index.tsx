import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Alert,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AddPropertyModal from '@/components/modals/AddPropertyModal';
import AddIncomeModal from '@/components/modals/AddIncomeModal';
import AddExpensesModal from '@/components/modals/AddExpensesModal';
import RemovePropertyModal from '@/components/modals/RemovePropertyModal';
import UpdatePropertyModal from '@/components/modals/UpdatePropertyModal';
import AddCoordinatesModal from '@/components/modals/AddCoordinatesModal';
import AddFilesModal from '@/components/modals/AddFilesModal';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MarketplaceListing } from '@/data/marketplaceListings';
import { useGlobalContext } from '@/context/GlobalProvider';
   

type ManagementOption = {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: string;
    color: string;
};

const managementOptions: ManagementOption[] = [
    {
        title: 'Add Property',
        icon: 'home-outline',
        action: 'addProperty',
        color: '#3B82F6',
    },
    {
        title: 'Add Files/Images',
        icon: 'images-outline',
        action: 'addFiles',
        color: '#F97316',
    },
    {
        title: 'Add Coordinates',
        icon: 'navigate-outline',
        action: 'addCoordinates',
        color: '#14B8A6',
    },
    {
        title: 'Add Income',
        icon: 'cash-outline',
        action: 'addIncome',
        color: '#10B981',
    },
    {
        title: 'Add Expenses',
        icon: 'card-outline',
        action: 'addExpense',
        color: '#F59E0B',
    },
    {
        title: 'Remove Property',
        icon: 'trash-outline',
        action: 'removeProperty',
        color: '#EF4444',
    },
    {
        title: 'Update Property',
        icon: 'create-outline',
        action: 'updateProperty',
        color: '#8B5CF6',
    },
    {
        title: 'List to Market',
        icon: 'megaphone-outline',
        action: 'listToMarket',
        color: '#EC4899',
    },
];

export default function ManagePropertyPage() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { user } = useGlobalContext();

    const router = useRouter();

    const [addPropertyVisible, setAddPropertyVisible] = useState(false);
    const [addIncomeVisible, setAddIncomeVisible] = useState(false);
    const [addExpensesVisible, setAddExpensesVisible] = useState(false);
    const [removePropertyVisible, setRemovePropertyVisible] = useState(false);
    const [updatePropertyVisible, setUpdatePropertyVisible] = useState(false);
    const [listToMarketVisible, setListToMarketVisible] = useState(false);
    const [addCoordinatesVisible, setAddCoordinatesVisible] = useState(false);
    const [addFilesVisible, setAddFilesVisible] = useState(false);

    const handleAddProperty = async () => {
        try {
            const storedListings = await AsyncStorage.getItem('marketplaceListings');
            let listings: MarketplaceListing[] = storedListings
                ? JSON.parse(storedListings)
                : [];

            const newListingId = Date.now().toString();
            const newListing: MarketplaceListing = {
                id: newListingId,
                user_id: user?.email || 'user-1',
                listing_type: 'Corporate',
                property_name: '',
                property_type: '',
                location: '',
                city: '',
                state: '',
                description: '',
                property_value: 0,
                roi_percentage: 0,
                estimated_yield: 0,
                completion_percentage: 0,
                current_step: 0,
                status: 'Draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            listings.push(newListing);
            await AsyncStorage.setItem('marketplaceListings', JSON.stringify(listings));

            router.push({
                pathname: '/(app)/(listings)/listing-workflow',
                params: { id: newListingId, new: 'true' },
            });
        } catch (error) {
            console.error('Error creating listing:', error);
            Alert.alert('Error', 'Failed to create listing');
        }
    };

    const handleOptionPress = (action: string) => {
        switch (action) {
            case 'addProperty':
                setAddPropertyVisible(true);
                break;
            case 'addIncome':
                setAddIncomeVisible(true);
                break;
            case 'addExpense':
                setAddExpensesVisible(true);
                break;
            case 'removeProperty':
                setRemovePropertyVisible(true);
                break;
            case 'updateProperty':
                setUpdatePropertyVisible(true);
                break;
            case 'listToMarket':
                handleAddProperty();
                break;
            case 'addCoordinates':
                setAddCoordinatesVisible(true);
                break;
            case 'addFiles':
                setAddFilesVisible(true);
                break;
        }
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, isDark && styles.titleDark]}>
                        Manage Properties
                    </Text>
                    <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                        Follow the numbered order below to effectively manage your properties
                    </Text>
                </View>

                <View style={styles.grid}>
                    {managementOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.card, isDark && styles.cardDark]}
                            onPress={() => handleOptionPress(option.action)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.numberBadge}>
                                    <Text style={styles.numberText}>{index + 1}</Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: `${option.color}20` },
                                ]}
                            >
                                <Ionicons name={option.icon} size={28} color={option.color} />
                            </View>
                            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                                {option.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <AddPropertyModal
                visible={addPropertyVisible}
                onClose={() => setAddPropertyVisible(false)}
            />
            <AddIncomeModal
                visible={addIncomeVisible}
                onClose={() => setAddIncomeVisible(false)}
            />
            <AddExpensesModal
                visible={addExpensesVisible}
                onClose={() => setAddExpensesVisible(false)}
            />
            <RemovePropertyModal
                visible={removePropertyVisible}
                onClose={() => setRemovePropertyVisible(false)}
            />
            <UpdatePropertyModal
                visible={updatePropertyVisible}
                onClose={() => setUpdatePropertyVisible(false)}
            />

            <AddCoordinatesModal
                visible={addCoordinatesVisible}
                onClose={() => setAddCoordinatesVisible(false)}
            />
            <AddFilesModal
                visible={addFilesVisible}
                onClose={() => setAddFilesVisible(false)}
            />
        </View>
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
    scrollContent: {
        padding: 20,
        paddingTop: 20,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    titleDark: {
        color: '#F9FAFB',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    subtitleDark: {
        color: '#9CA3AF',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    card: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    cardHeader: {
        position: 'absolute',
        top: 12,
        left: 12,
    },
    numberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#bac0c9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    cardTitleDark: {
        color: '#E5E7EB',
    },
});
