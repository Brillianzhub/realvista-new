import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();

  const router = useRouter();

  const handleBackPress = () => {
    router.replace('/(app)/(tabs)');
  };

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Manage Pro Subscription',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <TouchableOpacity onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={24} color={colors.tint} />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </>
  );
}
