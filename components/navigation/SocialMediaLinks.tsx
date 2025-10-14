import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  useColorScheme,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type SocialLink = {
  id: string;
  name: string;
  iconName: string;
  url: string;
  color: string;
};

export default function SocialMediaLinks() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const socialLinks: SocialLink[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      iconName: 'facebook',
      url: 'https://www.facebook.com/share/1FaQPGrXEN/',
      color: '#1877F2',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      iconName: 'twitter',
      url: 'https://x.com/Realvista_NG?t=4wyone_-O3TiMPEgw9Gw-w&s=09',
      color: '#1DA1F2',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      iconName: 'linkedin',
      url: 'https://www.linkedin.com/company/realvista-ng/',
      color: '#0A66C2',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      iconName: 'instagram',
      url: 'https://www.instagram.com/realvista_ng?igsh=MXVtazk2aWV5Mzl1ZA==',
      color: '#E4405F',
    },
  ];

  const handleSocialPress = async (name: string, url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open Link', `Unable to open ${name}. Please check your internet connection.`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${name}.`);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        Connect With Us
      </Text>
      <View style={styles.socialIconsContainer}>
        {socialLinks.map((social) => (
          <TouchableOpacity
            key={social.id}
            style={[styles.iconButton, isDark && styles.iconButtonDark]}
            onPress={() => handleSocialPress(social.name, social.url)}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={social.iconName as any}
              size={30}
              color="#358B8B"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    borderTopColor: '#374151',
    backgroundColor: '#1F2937',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  titleDark: {
    color: '#9CA3AF',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
});
