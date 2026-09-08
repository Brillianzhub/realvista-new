import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import DrawerContent from '@/components/navigation/CustomDrawerContent';
import { Book, Home } from 'lucide-react-native';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';

export default function AppLayout() {
  // Hooks first, unconditionally, before the verification early-return
  // below — this file renders a real navigator (not a passthrough
  // <Slot/>), so the gate has to sit here rather than in the root layout.
  const { user, isLogged, loading } = useGlobalContext();

  // Temporary theme values until you add a real theme system
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Redirect to verify-email if logged in but not verified. Skipped while
  // GlobalProvider's initial hydrateUser() call is still in flight
  // (loading) — user/isLogged both start out falsy before that resolves,
  // which would otherwise misfire this redirect on every cold start.
  if (!loading && isLogged && user && !user.is_email_verified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  const colors = {
    background: isDark ? '#FFFFFF' : '#FFFFFF',
    drawerBackground: isDark ? '#1F2937' : '#F9FAFB',
    tint: isDark ? '#F9FAFB' : '#111827',
    text: isDark ? '#F3F4F6' : '#111827',
    iconColor: isDark ? '#FB902E' : '#358B8B',
  };

  return (
    <>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={colors.background}
      />
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: Platform.select({
            ios: 'front',
            android: 'front',
            default: 'permanent',
          }),
          drawerStyle: {
            width: 280,
            backgroundColor: colors.drawerBackground,
          },
          headerTitleStyle: {
            fontFamily: 'Inter-Medium',
            color: colors.text,
          },
          drawerActiveTintColor: '#2563eb', // blue-600
          drawerInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280', // gray shades
          overlayColor: 'rgba(0,0,0,0.4)',
        }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
            drawerIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Drawer.Screen
          name="(learn)"
          options={{
            drawerLabel: 'Learn',
            title: 'Learn',
            drawerIcon: ({ color, size }) => <Book color={color} size={size} />,
          }}
        />
        <Drawer.Screen
          name="(messages)"
          options={{
            drawerLabel: 'Messages',
            headerShown: false,
          }}
        />
      </Drawer>
    </>
  );
}
