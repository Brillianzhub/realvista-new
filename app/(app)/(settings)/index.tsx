import React from 'react';
import { StyleSheet, View } from 'react-native';
import CurrencySettings from '@/components/settings/CurrencySettings';
import UserPermissionSettings from '@/components/settings/UserPermissionSettings';
import { useTheme } from '@/context/ThemeContext';

const Settings: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <CurrencySettings />
      <UserPermissionSettings />
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
