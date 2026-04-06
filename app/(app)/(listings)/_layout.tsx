// app/search/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

const ListingsLayout = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { colors } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.tint,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            headerTitleAlign: 'center',
            title: 'Manage Listings',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)')}>
                <Ionicons name="arrow-back" size={24} color={colors.brand} />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="listing-workflow"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            headerTitleAlign: 'center',
            title: 'Listing Workflow',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.brand} />
              </TouchableOpacity>
            ),
          }}
        />

        <Stack.Screen
          name="update-listing"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
            headerTitleAlign: 'center',
            title: 'Update Listing',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={colors.brand} />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </>
  );
};

export default ListingsLayout;
