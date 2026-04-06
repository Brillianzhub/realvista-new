import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import CustomPicker from '@/components/forms/CustomPicker';
import CustomForm from '@/components/forms/CustomForm';

import { useCreateMarketProperty } from '@/hooks/portfolio/useCreateMarketProperty';

import { useListingLoader } from '@/utils/market/useListingLoader';
import { useGlobalContext } from '@/context/GlobalProvider';
import useFetchVendorProperties from '@/hooks/market/useVendorListing';

type PropertyFeatures = {
  listing_purpose: string;
  state: string;
  category: string;
  price: string;
  currency: string;
  negotiable: 'yes' | 'slightly' | 'no';
  furnished: boolean;
  pet_friendly: boolean;
  parking_available: boolean;
  swimming_pool: boolean;
  garden: boolean;
  electricity_proximity: string;
  road_network: string;
  development_level: string;
  water_supply: boolean;
  security: boolean;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
};

type AddFeaturesModalProps = {
  visible: boolean;
  listingId: string | null;
  onClose: () => void;
  mode: 'create' | 'update';
  onSuccess?: () => void;
};

export default function AddFeaturesModal({
  visible,
  listingId,
  onClose,
  onSuccess,
}: AddFeaturesModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);

  const { user } = useGlobalContext();
  const { properties } = useFetchVendorProperties(user?.email || null);

  const {
    createMarketProperty,
    loading: listingToMarket,
    error: listingProperty,
  } = useCreateMarketProperty();

  const [propertyType, setPropertyType] = useState<string>('');

  const [formData, setFormData] = useState<PropertyFeatures>({
    listing_purpose: '',
    state: '',
    category: 'p2p',
    price: '',
    currency: 'NGN',
    negotiable: 'no',
    bedrooms: 0,
    bathrooms: 0,
    size: 0,

    furnished: false,
    pet_friendly: false,
    parking_available: false,
    swimming_pool: false,
    garden: false,
    electricity_proximity: 'moderate',
    road_network: 'good',
    development_level: 'moderate',
    water_supply: false,
    security: false,
  });

  const {} = useListingLoader({
    listingId: listingId ?? null,
    properties,
    onListingLoaded: (listing) => {
      if (listing?.features) {
        setFormData(listing.features as PropertyFeatures);
      }

      if (listing?.property_type) {
        setPropertyType(listing.property_type);
      }
    },
  });

  useEffect(() => {
    if (visible && !listingId) {
      resetForm();
    }
  }, [visible, listingId]);

  const resetForm = () => {
    setFormData({
      state: 'Abia',
      listing_purpose: 'sale',
      category: 'p2p',
      price: '',
      currency: 'NGN',
      negotiable: 'no',
      bedrooms: 0,
      bathrooms: 0,
      size: 0,

      furnished: false,
      pet_friendly: false,
      parking_available: false,
      swimming_pool: false,
      garden: false,
      electricity_proximity: 'moderate',
      road_network: 'good',
      development_level: 'moderate',
      water_supply: false,
      security: false,
    });
  };

  const isLandType = ['land', 'farm_land'].includes(propertyType);

  const handleInputChange = (key: keyof PropertyFeatures, value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const formatNumberWithCommas = (value: string) => {
    if (!value) return value;
    const numericValue = value.replace(/[^0-9.]/g, '');
    const [whole, decimal] = numericValue.split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimal !== undefined
      ? `${formattedWhole}.${decimal}`
      : formattedWhole;
  };

  const removeCommas = (value: string) => value.replace(/,/g, '');

  const handleSubmit = async () => {
    if (!listingId) return;

    setLoading(true);

    try {
      let propertyId = listingId;

      // falls backend_ prefix
      if (typeof propertyId === 'string' && propertyId.startsWith('backend_')) {
        propertyId = propertyId.replace('backend_', '');
      }

      // ✅ FINAL PAYLOAD
      const payload = {
        state: formData.state,
        category: formData.category,
        price: formData.price,
        currency: formData.currency,
        listing_purpose: formData.listing_purpose,
        negotiable: formData.negotiable,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        size: formData.size,

        features: {
          ...formData, // ✅ direkt verwenden
        },
      };

      // 🔥 EIN CALL → Backend macht alles
      const result = await createMarketProperty(Number(propertyId), payload);

      if (result) {
        Alert.alert(
          'Success ✅',
          'Your property has been successfully listed.',
        );

        onSuccess?.();
        onClose(); // Modal schließen
      } else {
        Alert.alert('Error ❌', 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const FeatureToggle = ({
    label,
    value,
    onToggle,
    icon,
  }: {
    label: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.featureToggle,
        value && styles.featureToggleActive,
        isDark && styles.featureToggleDark,
        isDark && value && styles.featureToggleActiveDark,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={value ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
      />
      <Text
        style={[
          styles.featureToggleText,
          value && styles.featureToggleTextActive,
          isDark && styles.featureToggleTextDark,
        ]}
      >
        {label}
      </Text>
      {value && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color="#FFFFFF"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  const stateOptions = [
    { label: 'Abia', value: 'abia' },
    { label: 'Adamawa', value: 'adamawa' },
    { label: 'Akwa Ibom', value: 'akwa_ibom' },
    { label: 'Anambra', value: 'anambra' },
    { label: 'Bauchi', value: 'bauchi' },
    { label: 'Bayelsa', value: 'bayelsa' },
    { label: 'Benue', value: 'benue' },
    { label: 'Borno', value: 'borno' },
    { label: 'Cross River', value: 'cross_river' },
    { label: 'Delta', value: 'delta' },
    { label: 'Ebonyi', value: 'ebonyi' },
    { label: 'Edo', value: 'edo' },
    { label: 'Ekiti', value: 'ekiti' },
    { label: 'Enugu', value: 'enugu' },
    { label: 'Gombe', value: 'gombe' },
    { label: 'Imo', value: 'imo' },
    { label: 'Jigawa', value: 'jigawa' },
    { label: 'Kaduna', value: 'kaduna' },
    { label: 'Kano', value: 'kano' },
    { label: 'Katsina', value: 'katsina' },
    { label: 'Kebbi', value: 'kebbi' },
    { label: 'Kogi', value: 'kogi' },
    { label: 'Kwara', value: 'kwara' },
    { label: 'Lagos', value: 'lagos' },
    { label: 'Nasarawa', value: 'nasarawa' },
    { label: 'Niger', value: 'niger' },
    { label: 'Ogun', value: 'ogun' },
    { label: 'Ondo', value: 'ondo' },
    { label: 'Osun', value: 'osun' },
    { label: 'Oyo', value: 'oyo' },
    { label: 'Plateau', value: 'plateau' },
    { label: 'Rivers', value: 'rivers' },
    { label: 'Sokoto', value: 'sokoto' },
    { label: 'Taraba', value: 'taraba' },
    { label: 'Yobe', value: 'yobe' },
    { label: 'Zamfara', value: 'zamfara' },

    // ✅ Federal Capital Territory
    { label: 'Abuja (FCT)', value: 'fct' },
  ];

  const currencyOptions = [
    { label: '₦ (NGN)', value: 'NGN' },
    { label: '$ (USD)', value: 'USD' },
    { label: '£ (GBP)', value: 'GBP' },
    { label: '€ (EUR)', value: 'EUR' },
  ];

  const listingPurpose = [
    { label: 'For Sale', value: 'sale' },
    { label: 'For Lease', value: 'lease' },
    { label: 'For Rent', value: 'rent' },
  ];

  const categoryOptions = [
    { label: 'Corporate', value: 'corporate' },
    { label: 'Peer-to-Peer', value: 'p2p' },
  ];

  const negotiableOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'Slightly', value: 'slightly' },
    { label: 'No', value: 'no' },
  ];

  const electricityOptions = [
    { label: 'Yes', value: 'available' },
    { label: 'Nearby (Less than 100m)', value: 'nearby' },
    { label: 'Moderate (100m - 500m)', value: 'moderate' },
    { label: 'Far (Above 500m)', value: 'far' },
  ];

  const roadNetworkOptions = [
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
  ];

  const developmentLevelOptions = [
    { label: 'Highly Developed', value: 'high' },
    { label: 'Moderately Developed', value: 'moderate' },
    { label: 'Sparsely Developed', value: 'low' },
    { label: 'Undeveloped', value: 'undeveloped' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, isDark && styles.containerDark]}>
          <View style={[styles.header, isDark && styles.headerDark]}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Property Features
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#F9FAFB' : '#111827'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              We need some additional details about your property to create a
              compelling listing.
            </Text>

            <CustomPicker
              label="Listing Purpose"
              options={listingPurpose}
              selectedValue={formData.listing_purpose}
              onValueChange={(value) =>
                handleInputChange('listing_purpose', value)
              }
            />

            <CustomPicker
              label="Category"
              options={categoryOptions}
              selectedValue={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            />

            <CustomForm
              label="Price"
              required
              placeholder="Selling price of property"
              keyboardType="numeric"
              value={formatNumberWithCommas(formData.price)}
              onChangeText={(value) =>
                handleInputChange('price', removeCommas(value))
              }
            />

            <CustomPicker
              label="Currency"
              required
              placeholder="Select a currency"
              options={currencyOptions}
              selectedValue={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            />

            <CustomPicker
              label="Is the price negotiable?"
              options={negotiableOptions}
              selectedValue={formData.negotiable}
              onValueChange={(value) => handleInputChange('negotiable', value)}
            />

            {!isLandType && (
              <>
                <CustomForm
                  label="Size of Plot (in sq ft, sqm or acres)"
                  placeholder="Property size"
                  keyboardType="numeric"
                  value={formData.size?.toString()}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      size: text ? parseInt(text) : undefined,
                    })
                  }
                />
                <CustomForm
                  label="Bedrooms"
                  placeholder="Number of bedrooms"
                  keyboardType="numeric"
                  value={formData.bedrooms?.toString()}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      bedrooms: text ? parseInt(text) : undefined,
                    })
                  }
                />

                <CustomForm
                  label="Bathrooms"
                  placeholder="Number of bathrooms"
                  keyboardType="numeric"
                  value={formData.bathrooms?.toString()}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      bathrooms: text ? parseInt(text) : undefined,
                    })
                  }
                />
              </>
            )}

            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Property Amenities
            </Text>

            <View style={styles.featuresGrid}>
              <FeatureToggle
                label="Furnished"
                value={formData.furnished}
                onToggle={() =>
                  handleInputChange('furnished', !formData.furnished)
                }
                icon="home-outline"
              />
              <FeatureToggle
                label="Pet Friendly"
                value={formData.pet_friendly}
                onToggle={() =>
                  handleInputChange('pet_friendly', !formData.pet_friendly)
                }
                icon="paw-outline"
              />
              <FeatureToggle
                label="Parking"
                value={formData.parking_available}
                onToggle={() =>
                  handleInputChange(
                    'parking_available',
                    !formData.parking_available,
                  )
                }
                icon="car-outline"
              />
              <FeatureToggle
                label="Swimming Pool"
                value={formData.swimming_pool}
                onToggle={() =>
                  handleInputChange('swimming_pool', !formData.swimming_pool)
                }
                icon="water-outline"
              />
              <FeatureToggle
                label="Garden"
                value={formData.garden}
                onToggle={() => handleInputChange('garden', !formData.garden)}
                icon="leaf-outline"
              />
            </View>

            <Text
              style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}
            >
              Utilities & Infrastructure
            </Text>

            <CustomPicker
              label="Electricity Availability"
              options={electricityOptions}
              selectedValue={formData.electricity_proximity}
              onValueChange={(value) =>
                handleInputChange('electricity_proximity', value)
              }
            />

            <CustomPicker
              label="Road Network"
              options={roadNetworkOptions}
              selectedValue={formData.road_network}
              onValueChange={(value) =>
                handleInputChange('road_network', value)
              }
            />

            <CustomPicker
              label="Development Level"
              options={developmentLevelOptions}
              selectedValue={formData.development_level}
              onValueChange={(value) =>
                handleInputChange('development_level', value)
              }
            />

            <View style={styles.featuresGrid}>
              <FeatureToggle
                label="Water Supply"
                value={formData.water_supply}
                onToggle={() =>
                  handleInputChange('water_supply', !formData.water_supply)
                }
                icon="water"
              />
              <FeatureToggle
                label="Security"
                value={formData.security}
                onToggle={() =>
                  handleInputChange('security', !formData.security)
                }
                icon="shield-checkmark-outline"
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={[styles.footer, isDark && styles.footerDark]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Continue to List</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  featureToggle: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  featureToggleDark: {
    backgroundColor: '#374151',
  },
  featureToggleActive: {
    backgroundColor: '#FB902E',
  },
  featureToggleActiveDark: {
    backgroundColor: '#FB902E',
  },
  featureToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  featureToggleTextDark: {
    color: '#9CA3AF',
  },
  featureToggleTextActive: {
    color: '#FFFFFF',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerDark: {
    borderTopColor: '#374151',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#FB902E',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
