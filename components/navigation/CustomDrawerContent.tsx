import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { User, Settings, CircleHelp as HelpCircle, LogOut, Briefcase, TrendingUp, Target, Calculator, Users, BookOpen, ChartBar as BarChart3, DollarSign } from 'lucide-react-native';

interface DrawerItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const drawerItems: DrawerItem[] = [
    {
      id: '1',
      title: 'Portfolio',
      icon: Briefcase,
      onPress: () => console.log('Portfolio pressed'),
    },
    {
      id: '2',
      title: 'RealInvest',
      icon: DollarSign,
      onPress: () => console.log('RealInvest pressed'),
    },
    {
      id: '3',
      title: 'MutualInvest',
      icon: TrendingUp,
      onPress: () => console.log('MutualInvest pressed'),
    },
    {
      id: '4',
      title: 'Targets',
      icon: Target,
      onPress: () => console.log('Targets pressed'),
    },
    {
      id: '5',
      title: 'Calculator',
      icon: Calculator,
      onPress: () => console.log('Calculator pressed'),
    },
    {
      id: '6',
      title: 'Manager',
      icon: Users,
      onPress: () => console.log('Manager pressed'),
    },
    {
      id: '7',
      title: 'Learn',
      icon: BookOpen,
      onPress: () => console.log('Learn pressed'),
    },
    {
      id: '8',
      title: 'Trends',
      icon: BarChart3,
      onPress: () => console.log('Trends pressed'),
    },
  ];

  const bottomItems: DrawerItem[] = [
    {
      id: '9',
      title: 'Settings',
      icon: Settings,
      onPress: () => console.log('Settings pressed'),
    },
    {
      id: '10',
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: () => console.log('Help pressed'),
    },
    {
      id: '11',
      title: 'Sign Out',
      icon: LogOut,
      onPress: () => console.log('Sign out pressed'),
    },
  ];

  const renderDrawerItem = (item: DrawerItem, isBottomItem = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.drawerItem, isBottomItem && styles.bottomDrawerItem]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <item.icon size={24} color={isBottomItem ? '#6b7280' : '#374151'} />
      <Text style={[styles.drawerItemText, isBottomItem && styles.bottomDrawerItemText]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userEmail}>john.doe@example.com</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Investment Tools</Text>
          {drawerItems.map((item) => renderDrawerItem(item))}
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomSection}>
          {bottomItems.map((item) => renderDrawerItem(item, true))}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomDrawerItem: {
    backgroundColor: '#f9fafb',
  },
  bottomDrawerItemText: {
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    marginVertical: 8,
  },
});