// components/QuickActions.tsx (Round gradient icons with text outside)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import HelpSupportModal from '../navigation/HelpSupportModal';

const { width } = Dimensions.get('window');
const paddingHorizontal = 20;
const gap = 12;
//const iconSize = (width - paddingHorizontal * 2 - gap * 2) / 6;

const iconSize = 56;

interface Action {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconSet: 'ionicons' | 'material' | 'fa5';
  route?: string; // Made optional since support doesn't use it
  onPress?: () => void; // Added for custom handlers
  colors: [string, string];
}

const actions: Action[] = [
  {
    id: 'add',
    title: 'Add property',
    subtitle: 'New asset',
    icon: 'home-outline',
    iconSet: 'ionicons',
    route: '/(manage)',
    colors: ['#358B8B', '#2A6F6F'], // Teal
  },
  {
    id: 'learn',
    title: 'Learn',
    subtitle: 'Guides',
    icon: 'book-outline',
    iconSet: 'ionicons',
    route: '/(app)/(learn)',
    colors: ['#8B5CF6', '#6D28D9'], // Purple
  },
  {
    id: 'news',
    title: 'Trends',
    subtitle: 'News & Updates',
    icon: 'newspaper-outline',
    iconSet: 'ionicons',
    route: '/(app)/(trends)',
    colors: ['#F59E0B', '#D97706'], // Amber/Orange
  },
  {
    id: 'listing',
    title: 'My Listings',
    subtitle: 'Sell/rent',
    icon: 'business-outline',
    iconSet: 'ionicons',
    route: '/(app)/(listings)',
    colors: ['#EF4444', '#DC2626'], // Red
  },
  {
    id: 'target',
    title: 'Target',
    subtitle: 'Set Financial Goals',
    icon: 'target',
    iconSet: 'material',
    route: '/(app)/(savings)',
    colors: ['#06B6D4', '#0891B2'], // Cyan
  },
  {
    id: 'support',
    title: 'Support',
    subtitle: 'Help',
    icon: 'headset',
    iconSet: 'material',
    onPress: () => {}, // Placeholder - will be set in component
    colors: ['#10B981', '#059669'], // Emerald Green
  },
];

const QuickActions: React.FC = () => {
  const { colors } = useTheme();

  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHelpSupportPress = () => {
    setShowHelpModal(true);
  };

  // Update the support action with the actual handler
  const actionsWithHandlers = actions.map((action) => {
    if (action.id === 'support') {
      return { ...action, onPress: handleHelpSupportPress };
    }
    return action;
  });

  const renderIcon = (action: Action) => {
    switch (action.iconSet) {
      case 'ionicons':
        return <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />;
      case 'material':
        return (
          <MaterialCommunityIcons
            name={action.icon as any}
            size={24}
            color="#FFFFFF"
          />
        );
      case 'fa5':
        return (
          <FontAwesome5 name={action.icon as any} size={22} color="#FFFFFF" />
        );
      default:
        return <Ionicons name="apps-outline" size={24} color="#FFFFFF" />;
    }
  };

  const handlePress = (action: Action) => {
    if (action.onPress) {
      action.onPress();
    } else if (action.route) {
      router.push(action.route as any);
    }
  };

  // Split actions into rows of 3
  const rows = [];
  for (let i = 0; i < actionsWithHandlers.length; i += 3) {
    rows.push(actionsWithHandlers.slice(i, i + 3));
  }

  return (
    <View style={[styles.container]}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
        Quick Actions
      </Text>

      {/* Single background wrapper for all rows */}
      <View
        style={[
          styles.allRowsWrapper,
          { backgroundColor: colors.background.secondary },
        ]}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.8}
                style={styles.actionItem}
                onPress={() => handlePress(action)}
              >
                <LinearGradient
                  colors={action.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconCircle}
                >
                  {renderIcon(action)}
                </LinearGradient>
                <Text
                  style={[styles.actionTitle, { color: colors.text.primary }]}
                >
                  {action.title}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.text.secondary },
                  ]}
                >
                  {action.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <HelpSupportModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  allRowsWrapper: {
    borderRadius: 20,
    padding: 16,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: iconSize,
    height: iconSize,
    borderRadius: iconSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
});

export default QuickActions;
