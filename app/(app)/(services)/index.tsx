import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const services: ServiceCard[] = [
  {
    id: '1',
    icon: 'document-text',
    title: 'Document Verification',
    description:
      'We verify land and property documents at state land registry offices to confirm authenticity and protect you from fraud.',
  },
  {
    id: '2',
    icon: 'clipboard',
    title: 'Property Registration',
    description:
      'We handle title registration, Certificate of Occupancy (C of O), and all property documentation with government agencies.',
  },
  {
    id: '3',
    icon: 'home',
    title: 'Property Management',
    description:
      'We maintain and oversee properties for clients abroad, ensuring rent collection, maintenance, and tenant integrity.',
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    title: 'Fraud Prevention',
    description:
      'We safeguard diaspora clients from scams and family-related property fraud through due diligence and trusted partners.',
  },
];

const whyChooseUs = [
  {
    id: '1',
    icon: 'checkmark-circle',
    text: 'Experienced in Nigerian property systems',
  },
  {
    id: '2',
    icon: 'checkmark-circle',
    text: 'Transparent processes and verified agents',
  },
  {
    id: '3',
    icon: 'checkmark-circle',
    text: 'Legal and on-ground support across major states',
  },
  {
    id: '4',
    icon: 'checkmark-circle',
    text: 'Ideal for Nigerians in the diaspora',
  },
];

export default function PropertyManagementServicesScreen() {
  const router = useRouter();
  const contactSectionRef = useRef<ScrollView>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToContact = () => {
    contactSectionRef.current?.scrollToEnd({ animated: true });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      Alert.alert(
        'Success',
        'Thank you for your inquiry! We will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ name: '', email: '', phone: '', message: '' });
            },
          },
        ]
      );
      setIsSubmitting(false);
    }, 1500);
  };

  const handleContactMethod = (method: 'email' | 'whatsapp' | 'website') => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:info@realvistamanagement.com');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/2348123456789');
        break;
      case 'website':
        Linking.openURL('https://www.realvistamanagement.com');
        break;
    }
  };

  return (
    <ScrollView ref={contactSectionRef} style={styles.container}>
      <View style={styles.heroSection}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Trusted Property Management & Verification in Nigeria
          </Text>
          <Text style={styles.heroSubtitle}>
            We help diaspora clients verify, register, and manage their properties with
            integrity and transparency.
          </Text>
          <TouchableOpacity style={styles.heroButton} onPress={scrollToContact}>
            <Text style={styles.heroButtonText}>Book Consultation</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <Text style={styles.sectionSubtitle}>
          Comprehensive property solutions tailored for diaspora clients
        </Text>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceIconContainer}>
                <Ionicons name={service.icon as any} size={32} color="#14B8A6" />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.whyChooseSection}>
        <Text style={styles.sectionTitle}>Why Choose Us</Text>
        <Text style={styles.sectionSubtitle}>
          Your trusted partner in Nigerian real estate
        </Text>
        <View style={styles.whyChooseList}>
          {whyChooseUs.map((item) => (
            <View key={item.id} style={styles.whyChooseItem}>
              <Ionicons name={item.icon as any} size={24} color="#14B8A6" />
              <Text style={styles.whyChooseText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={48} color="#14B8A6" />
          <Text style={styles.trustBadgeText}>
            Verified & Licensed Property Management Services
          </Text>
        </View>
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Book a Consultation</Text>
        <Text style={styles.contactIntro}>
          Book a free consultation to discuss your property needs in Nigeria.
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Phone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your property needs..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
            </Text>
            {!isSubmitting && <Ionicons name="send" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTACT US DIRECTLY</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.contactMethods}>
          <TouchableOpacity
            style={styles.contactMethodCard}
            onPress={() => handleContactMethod('email')}
          >
            <Ionicons name="mail" size={28} color="#14B8A6" />
            <Text style={styles.contactMethodLabel}>Email</Text>
            <Text style={styles.contactMethodValue}>info@realvistamanagement.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactMethodCard}
            onPress={() => handleContactMethod('whatsapp')}
          >
            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
            <Text style={styles.contactMethodLabel}>WhatsApp</Text>
            <Text style={styles.contactMethodValue}>+234 812 345 6789</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactMethodCard}
            onPress={() => handleContactMethod('website')}
          >
            <Ionicons name="globe" size={28} color="#14B8A6" />
            <Text style={styles.contactMethodLabel}>Website</Text>
            <Text style={styles.contactMethodValue} numberOfLines={1}>
              realvistamanagement.com
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  heroSection: {
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  whyChooseSection: {
    padding: 24,
    backgroundColor: '#ECFDF5',
    marginBottom: 2,
  },
  whyChooseList: {
    gap: 16,
    marginBottom: 32,
  },
  whyChooseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  whyChooseText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  trustBadge: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  trustBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  contactSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  contactIntro: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  contactMethods: {
    gap: 16,
  },
  contactMethodCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 8,
  },
  contactMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  contactMethodValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
});
