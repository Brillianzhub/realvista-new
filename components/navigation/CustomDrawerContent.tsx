import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { UserIcon, UserPen, GlobeLock, NotepadText, Handshake, Save, Settings, CircleHelp as HelpCircle, Briefcase, FileQuestion, Calculator } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import HelpSupportModal from './HelpSupportModal';
import SocialMediaLinks from './SocialMediaLinks';

interface DrawerItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useGlobalContext();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const name = user?.name || user?.first_name || "Unnamed User";
  const email = user?.email || user?.agent?.user || "No email";
  const avatarUrl =
    user?.profile?.avatar ||
    user?.agent?.avatar ||
    "https://via.placeholder.com/150";
  const agencyName = user?.agent?.agency_name || null;

  const handleHelpSupportPress = () => {
    props.navigation.closeDrawer();
    setTimeout(() => {
      setShowHelpModal(true);
    }, 300);
  };

  const drawerItems: DrawerItem[] = [
    {
      id: '1',
      title: 'Profile',
      icon: UserPen,
      onPress: () => router.push('/(app)/(profile)'),
    },
    {
      id: '2',
      title: 'Saved Properties',
      icon: Save,
      onPress: () => router.push('/(app)/(favorites)'),
    },
    {
      id: '3',
      title: 'Property Management',
      icon: NotepadText,
      onPress: () => router.push('/(app)/(services)'),
    },
    {
      id: '4',
      title: 'Property Estimator',
      icon: Calculator,
      onPress: () => router.push('/(app)/(estimator)'),
    },
    {
      id: '5',
      title: 'Manage Portfolio',
      icon: Briefcase,
      onPress: () => router.push('/(app)/(manage)'),
    },
    {
      id: '6',
      title: 'FAQ',
      icon: FileQuestion,
      onPress: () =>
        Linking.openURL('https://www.realvistaproperties.com/faq')
    },
    {
      id: '7',
      title: 'Privacy Policy',
      icon: GlobeLock,
      onPress: () =>
        Linking.openURL('https://www.realvistaproperties.com/privacy-policy')
    },
    {
      id: '8',
      title: 'Terms of Service',
      icon: Handshake,
      onPress: () =>
        Linking.openURL('https://www.realvistaproperties.com/terms')
    }
  ];

  const bottomItems: DrawerItem[] = [
    {
      id: '9',
      title: 'Settings',
      icon: Settings,
      onPress: () => router.push('/(app)/(settings)'),
    },
    {
      id: '10',
      title: 'Help & Support',
      icon: HelpCircle,
      onPress: handleHelpSupportPress,
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
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <UserIcon size={32} color="#ffffff" />
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              {agencyName && <Text style={styles.agency}>{agencyName}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {drawerItems.map((item) => renderDrawerItem(item))}
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomSection}>
          {bottomItems.map((item) => renderDrawerItem(item, true))}
        </View>
      </DrawerContentScrollView>

      <SocialMediaLinks />

      <HelpSupportModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </View>
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
    overflow: "hidden",
    backgroundColor: '#358B8B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  agency: {
    fontSize: 13,
    color: "#cfd8dc",
    marginTop: 2,
  },
  menuSection: {
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
