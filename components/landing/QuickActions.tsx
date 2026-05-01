// components/QuickActions.tsx (Gradient version)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 42) / 2;

interface Action {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconSet: 'ionicons' | 'material';
  route: string;
}

const brandColor = '#358B8B';
const brandColorDark = '#2A6F6F';
const brandColorLight = '#40A0A0';

const actions: Action[] = [
  {
    id: 'add',
    title: 'Manage property',
    subtitle: 'Add a new asset',
    icon: 'home-outline',
    iconSet: 'ionicons',
    route: '/(manage)',
  },
  {
    id: 'learn',
    title: 'Learn',
    subtitle: 'Investing guides',
    icon: 'book-outline',
    iconSet: 'ionicons',
    route: '/(app)/(learn)',
  },
  {
    id: 'news',
    title: 'Market news',
    subtitle: 'Trends & updates',
    icon: 'newspaper-outline',
    iconSet: 'ionicons',
    route: '/(app)/(trends)',
  },
  {
    id: 'listing',
    title: 'Manage listings',
    subtitle: 'List property to Market',
    icon: 'business-outline',
    iconSet: 'ionicons',
    route: '/(app)/(listings)',
  },
];

const QuickActions: React.FC = () => {
  const { colors } = useTheme();

  const renderIcon = (action: Action) => {
    const IconComponent =
      action.iconSet === 'ionicons' ? Ionicons : MaterialCommunityIcons;
    return (
      <IconComponent name={action.icon as any} size={20} color="#FFFFFF" />
    );
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Quick actions
      </Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            activeOpacity={0.8}
            style={styles.actionCard}
            onPress={() => handlePress(action.route)}
          >
            <LinearGradient
              colors={[brandColorLight, brandColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <View style={styles.iconContainer}>{renderIcon(action)}</View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: cardWidth,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#358B8B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientCard: {
    padding: 14,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#E0F0F0',
  },
});

export default QuickActions;
