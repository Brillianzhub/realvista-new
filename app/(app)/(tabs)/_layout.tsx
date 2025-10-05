import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Home, Briefcase, TrendingUp } from 'lucide-react-native';
import { Menu } from 'lucide-react-native';

export default function TabLayout() {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 65,
          // paddingBottom: 8,
        },
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#1f2937',
        },
        headerStatusBarHeight: 0,

        headerLeft: () => (
          <TouchableOpacity
            onPress={toggleDrawer}
            style={{
              marginLeft: 16,
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#f3f4f6',
            }}
            activeOpacity={0.7}
          >
            <Menu size={24} color="#374151" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'RealVista',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          headerTitle: 'Portfolio',
          tabBarIcon: ({ size, color }) => (
            <Briefcase size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          headerTitle: 'Market Analysis',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}