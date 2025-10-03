import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import DrawerContent from '@/components/navigation/CustomDrawerContent';
import { Book, Home } from 'lucide-react-native';

export default function AppLayout() {
    // Temporary theme values until you add a real theme system
    const isDark = false; // change to true if you want to simulate dark mode
    const colors = {
        background: isDark ? '#111827' : '#FFFFFF', // dark gray vs white
        drawerBackground: isDark ? '#1F2937' : '#F9FAFB', // darker gray vs light gray
        text: isDark ? '#F3F4F6' : '#111827', // light vs dark
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
            </Drawer>
        </>
    );
}
