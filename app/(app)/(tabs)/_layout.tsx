// app/_layout.tsx
import { router, Tabs } from 'expo-router';
import {
  TouchableOpacity,
  useColorScheme,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Home, Menu, TrendingUp, User } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#111827' : '#FFFFFF',
    tint: isDark ? '#F9FAFB' : '#111827',
    text: isDark ? '#F3F4F6' : '#1C1C1E',
    iconColor: isDark ? '#FB902E' : '#358B8B',
    tabBarActive: '#FB902E',
    tabBarInactive: '#358B8B',
  };

  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());

  return (
    <>
      {/*
        light  → dark icons/text on the status bar (for light backgrounds)
        dark   → white icons/text on the status bar (for dark backgrounds)
        expo-status-bar reads the prop name as the icon style, opposite to
        React Native's StatusBar barStyle convention.
      */}
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            height: 65,
          },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
          },
          headerStatusBarHeight: 0,
          headerLeft: () => (
            <TouchableOpacity
              onPress={toggleDrawer}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Menu size={24} color="#374151" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(app)/(profile)')}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <User size={24} color="#374151" />
            </TouchableOpacity>
          ),
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0.5,
            borderTopColor: '#E5E5EA',
            paddingBottom: 12,
            paddingTop: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Overview',
            headerTitle: 'My Portfolio',
            headerTitleStyle: {
              color: colors.text,
              fontSize: 20,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
            tabBarLabel: 'Overview',
          }}
        />

        <Tabs.Screen
          name="properties"
          options={{
            title: 'Properties',
            headerTitle: 'My Properties',
            headerTitleStyle: {
              color: colors.text,
              fontSize: 20,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            tabBarLabel: 'Properties',
          }}
        />

        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            headerTitle: 'Portfolio Analytics',
            headerTitleStyle: {
              color: colors.text,
              fontSize: 20,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => (
              <TrendingUp size={size} color={color} />
            ),
            tabBarLabel: 'Analytics',
          }}
        />

        <Tabs.Screen
          name="market"
          options={{
            title: 'Market',
            headerTitle: 'Market',
            headerTitleStyle: {
              color: colors.text,
              fontSize: 20,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business-outline" size={size} color={color} />
            ),
            tabBarLabel: 'Market',
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});
