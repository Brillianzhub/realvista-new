import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { formatCurrency } from '@/utils/general/formatCurrency';
import { useGlobalContext } from '@/context/GlobalProvider';
import PortfolioMediaGallery from '@/components/portfolio/PortfolioMediaGallery';
import PropertyMapView from '@/components/portfolio/PropertyMapView';
import { useSingleProperty } from '@/hooks/portfolio/useSingleProperty';
import AddCoordinatesModal from '@/components/modals/AddCoordinatesModal';
import { Coordinate } from '@/components/forms/CoordinateForm';
import { useTheme } from '@/context/ThemeContext';
import AddFeaturesModal from '@/components/modals/PortfolioPropertyFeaturesModal';

const screenWidth = Dimensions.get('window').width;

const formatROI = (
  initial_cost: string | number,
  current_value: string | number,
): string => {
  const initial = parseFloat(initial_cost as string);
  const current = parseFloat(current_value as string);

  if (!initial || initial <= 0) return 'N/A';

  const roi = ((current - initial) / initial) * 100;

  return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
};

export default function PropertyDetailScreen() {
  const router = useRouter();

  const user = useGlobalContext().user;

  const { colors, theme } = useTheme();

  const [isEditCoordinateVisible, setIsEditCoordinateVisible] = useState(false);
  const [editCoordinate, setEditCoordinate] = useState<Coordinate | null>(null);
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);
  const [editCoordinateId, setEditCoordinateId] = useState<number | null>(null);

  const [isFeaturesModalVisible, setIsFeaturesModalVisible] = useState(false);

  const { id } = useLocalSearchParams();

  const { property, loading, error, refetch } = useSingleProperty(Number(id));

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
          Loading property...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          <Text style={{ color: colors.text.primary, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <Text style={{ color: colors.text.primary }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          <Text style={{ color: colors.text.primary, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: colors.text.primary }}>Property not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const incomes = property.incomes || [];
  const expenses = property.expenses || [];

  // The API returns `images` ({id, image_url, uploaded_at}) and `files`
  // ({id, name, file_url, file_type, uploaded_at}) — not image_files or
  // property_files. Images/videos are merged into one gallery feed;
  // `source` tracks which table each item came from since they're deleted
  // via different endpoints (/images/<id>/ vs /files/<id>/).
  const galleryMedia = [
    ...(property.images || []).map((img: any) => ({
      id: img.id,
      file: img.image_url,
      file_type: 'image' as const,
      name: 'Photo',
      source: 'image' as const,
    })),
    ...(property.files || [])
      .filter((f: any) => f.file_type === 'image' || f.file_type === 'video')
      .map((f: any) => ({
        id: f.id,
        file: f.file_url,
        file_type: f.file_type,
        name: f.name || 'File',
        source: 'file' as const,
      })),
  ];

  // Everything else uploaded via the generic file endpoint — pdf, doc, etc.
  const documentFiles = (property.files || []).filter(
    (f: any) => f.file_type !== 'image' && f.file_type !== 'video',
  );

  const totalIncome = incomes.reduce(
    (sum: number, item: any) => sum + parseFloat(item.amount || 0),
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum: number, item: any) => sum + parseFloat(item.amount || 0),
    0,
  );
  const netReturn = totalIncome - totalExpenses;

  const getAppreciationInsight = () => {
    const initial = parseFloat(property.initial_cost || '0');
    const current = parseFloat(property.current_value || '0');

    if (!initial || initial <= 0)
      return 'Initial cost data is unavailable for appreciation calculation.';

    const app = ((current - initial) / initial) * 100;

    if (app > 100) {
      return `The property has appreciated strongly by ${app.toFixed(
        2,
      )}%, indicating strong growth.`;
    } else if (app > 20) {
      return `The property has shown solid appreciation of ${app.toFixed(
        2,
      )}%, performing well in the market.`;
    } else if (app > 0) {
      return `The property has appreciated modestly by ${app.toFixed(
        2,
      )}%, showing stable growth.`;
    } else {
      return `The property has depreciated by ${Math.abs(app).toFixed(
        2,
      )}%, but market conditions may improve.`;
    }
  };

  const handleRefetch = async () => {
    try {
      await refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh property.');
    }
  };

  const validateBeforeListing = (property: any, user: any): string[] => {
    const errors: string[] = [];

    // 🏠 Property Checks
    if (!property.coordinates?.length) {
      errors.push('Add at least one location (coordinates)');
    }

    if (!property.images?.length) {
      errors.push('Upload at least one image');
    }

    // 👤 User Checks
    if (!user?.profile?.phone_number) {
      errors.push('Add your phone number in profile');
    }

    if (!user?.profile?.city) {
      errors.push('Add your city in profile');
    }

    return errors;
  };

  const handleListForSale = async () => {
    if (loading) return;

    const errors = validateBeforeListing(property, user);

    if (errors.length > 0) {
      Alert.alert('Missing Information ⚠️', errors.join('\n'));
      return;
    }

    setIsFeaturesModalVisible(true);
  };

  const handleEditCoordinate = () => {
    const firstCoordinate = property.coordinates?.[0];

    if (!firstCoordinate) {
      Alert.alert('Error', 'No coordinate available to edit.');
      return;
    }

    setEditCoordinate(firstCoordinate);
    setEditPropertyId(property.id.toString());
    setEditCoordinateId(firstCoordinate.id);
    setIsEditCoordinateVisible(true);
  };

  const capitalize = (text?: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <>
      <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.primary}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        showsVerticalScrollIndicator={false}
      >
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, {}]}
      >
        <Ionicons
          name="arrow-back-outline"
          size={24}
          color={colors.icon.default}
        />
      </TouchableOpacity>

      <View
        style={[styles.header, { borderBottomColor: colors.border.default }]}
      >
        <View style={styles.headerInfo}>
          <Text style={[styles.propertyName, { color: colors.text.primary }]}>
            {property.title}
          </Text>
          <View style={styles.headerStats}>
            <Text style={[styles.currentValue, { color: colors.text.primary }]}>
              {formatCurrency(property.current_value, property.currency)}
            </Text>
            <View style={styles.roiContainer}>
              <Ionicons
                name={
                  property.roi > 0 ? 'arrow-up-outline' : 'arrow-down-outline'
                }
                size={18}
                color={property.roi > 0 ? '#358B8B' : '#EF4444'}
              />
              <Text
                style={[
                  styles.roiText,
                  { color: property.roi > 0 ? '#358B8B' : '#EF4444' },
                ]}
              >
                {formatROI(property.initial_cost, property.current_value)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Performance Overview
        </Text>
        <View style={styles.performanceCards}>
          <View
            style={[
              styles.perfCard,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <Text style={[styles.perfLabel, { color: colors.text.primary }]}>
              Initial Cost
            </Text>
            <Text style={[styles.perfValue, { color: colors.text.primary }]}>
              {formatCurrency(property.initial_cost, property.currency)}
            </Text>
          </View>
          <View
            style={[
              styles.perfCard,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <Text style={[styles.perfLabel, { color: colors.text.primary }]}>
              Appreciation
            </Text>
            <Text
              style={[
                styles.perfValue,
                { color: property.appreciation > 0 ? '#358B8B' : '#EF4444' },
              ]}
            >
              {formatCurrency(
                property.appreciation.toFixed(1),
                property.currency,
              )}
            </Text>
          </View>
        </View>
        <Text style={[styles.insightText, { color: colors.text.muted }]}>
          {getAppreciationInsight()}
        </Text>
      </View>

      {property?.performance_data && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Graphical Performance
          </Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={property.performance_data}
              width={screenWidth - 32} // minus padding
              height={220}
              chartConfig={{
                backgroundColor: colors.background.secondary,
                backgroundGradientFrom: colors.background.secondary,
                backgroundGradientTo: colors.background.secondary,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#358B8B',
                },
              }}
              bezier
              style={styles.chart}
            />
            <View style={{ paddingTop: 8 }}>
              <Text
                style={{
                  textAlign: 'right',
                  color: colors.text.muted,
                  fontSize: 12,
                }}
              >
                Values in {property.currency} Millions
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Income & Expenses
        </Text>
        <View
          style={[
            styles.financeContainer,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <View style={styles.financeColumn}>
            <Text
              style={[styles.financeHeader, { color: colors.text.primary }]}
            >
              Income
            </Text>
            {property.incomes.map(
              (
                item: {
                  description?: string;
                  amount: number;
                  currency?: string;
                },
                index: number,
              ) => (
                <View key={index} style={styles.financeRow}>
                  <Text
                    style={[
                      styles.financeLabel,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {item.description || 'Income'}
                  </Text>
                  <Text
                    style={[
                      styles.financeAmount,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {formatCurrency(
                      item.amount,
                      item.currency || property.currency,
                    )}
                  </Text>
                </View>
              ),
            )}
            <View style={[styles.financeRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text.primary }]}>
                Total Income
              </Text>
              <Text
                style={[styles.totalAmount, { color: colors.text.primary }]}
              >
                {formatCurrency(totalIncome, property.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.financeColumn}>
            <Text
              style={[styles.financeHeader, { color: colors.text.primary }]}
            >
              Expenses
            </Text>
            {property.expenses.map(
              (
                item: {
                  description?: string;
                  amount: number;
                  currency?: string;
                },
                index: number,
              ) => (
                <View key={index} style={styles.financeRow}>
                  <Text
                    style={[
                      styles.financeLabel,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {item.description}
                  </Text>
                  <Text
                    style={[
                      styles.financeAmount,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {formatCurrency(
                      item.amount,
                      item.currency || property.currency,
                    )}
                  </Text>
                </View>
              ),
            )}
            <View style={[styles.financeRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text.primary }]}>
                Total Expenses
              </Text>
              <Text
                style={[styles.totalAmount, { color: colors.text.primary }]}
              >
                {formatCurrency(totalExpenses, property.currency)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.netReturnContainer,
              netReturn > 0 ? styles.positiveNet : styles.negativeNet,
            ]}
          >
            <Text style={styles.netReturnLabel}>Net Return</Text>
            <Text
              style={[
                styles.netReturnValue,
                { color: netReturn > 0 ? '#358B8B' : '#EF4444' },
              ]}
            >
              {formatCurrency(netReturn, property.currency)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Property Information
        </Text>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.text.secondary }]}
              >
                Description
              </Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {property.description}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.text.secondary }]}
              >
                Location
              </Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {`${capitalize(property.address)}, ${capitalize(
                  property.city,
                )}, ${capitalize(property.location)}`}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.text.secondary }]}
              >
                Number of Units
              </Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {property.num_units}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.text.secondary }]}
              >
                Year Bought
              </Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>
                {property.year_bought}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.text.secondary }]}
              >
                Investment Type
              </Text>
              <Text
                style={[styles.infoValue, { color: colors.text.primary }]}
              >{`${capitalize(property.property_type)}`}</Text>
            </View>
          </View>
        </View>
      </View>

      <PortfolioMediaGallery
        mediaFiles={galleryMedia}
        propertyTitle={property.title}
        propertyId={property.id}
        onRefetchNeeded={handleRefetch}
        editable={true}
      />

      {documentFiles.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Documents
          </Text>
          {documentFiles.map((file: any, i: number) => (
            <TouchableOpacity
              key={file.id ?? i}
              style={styles.fileRow}
              onPress={() => file.file_url && Linking.openURL(file.file_url)}
            >
              <Ionicons name="document-outline" size={20} color="#348b8b" />
              <Text style={[styles.fileName, { color: colors.text.primary }]}>
                {file.name || `Document ${i + 1}`}
              </Text>
              <Ionicons name="open-outline" size={16} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <PropertyMapView
        coordinates={property.coordinates || []}
        propertyTitle={property.title}
        city={property.city}
        location={property.location}
        address={property.address}
        editCoordinate={handleEditCoordinate}
      />

      <AddCoordinatesModal
        visible={isEditCoordinateVisible}
        onClose={() => setIsEditCoordinateVisible(false)}
        mode="edit"
        propertyId={editPropertyId ?? undefined}
        coordinate={editCoordinate ?? undefined}
        coordinateId={editCoordinateId ?? undefined}
        onRefetch={handleRefetch}
      />

      <AddFeaturesModal
        visible={isFeaturesModalVisible}
        listingId={property.id.toString()}
        onClose={() => setIsFeaturesModalVisible(false)}
        mode="update"
        onSuccess={handleRefetch}
      />

      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[
            styles.listButton,
            property.is_listed && styles.disabledButton,
          ]}
          onPress={handleListForSale}
          disabled={property.is_listed}
        >
          <Text
            style={[
              styles.listButtonText,
              property.is_listed && styles.disabledButtonText,
            ]}
          >
            {property.is_listed ? 'Already Listed' : 'List Property for Sale'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listButton}
          onPress={() => {
            router.push({
              pathname: '/(app)/(manage)',
              params: { id: property.id.toString() },
            });
          }}
        >
          <Text style={styles.listButtonText}>Update Property</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 0,
    paddingLeft: 16,
    paddingTop: 10,
  },
  headerInfo: {
    gap: 8,
  },
  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentValue: {
    fontFamily: 'RobotoSerif-Medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roiText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  performanceCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  perfCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  perfLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  perfValue: {
    fontFamily: 'RobotoSerif-Medium',
    fontSize: 18,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
  },
  financeContainer: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  financeColumn: {
    marginBottom: 20,
  },
  financeHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  financeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  financeAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  netReturnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  positiveNet: {
    backgroundColor: '#D1FAE5',
  },
  negativeNet: {
    backgroundColor: '#FEE2E2',
  },
  netReturnLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  netReturnValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: 250,
  },
  ctaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingBottom: 32,
    gap: 12,
  },
  listButton: {
    flex: 1,
    backgroundColor: '#358B8B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  disabledButton: {
    backgroundColor: '#D1D5DB', // grau
  },

  disabledButtonText: {
    color: '#6B7280',
  },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f0fafa',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
});
