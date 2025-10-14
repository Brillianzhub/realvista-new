import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Linking,
    useColorScheme,
    Alert,
} from 'react-native';
import { Mail, MessageCircle, X } from 'lucide-react-native';

type HelpSupportModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function HelpSupportModal({ visible, onClose }: HelpSupportModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleEmailSupport = async () => {
        const email = 'support@realvistaproperties.com';
        const mailtoUrl = `mailto:${email}`;

        try {
            const canOpen = await Linking.canOpenURL(mailtoUrl);
            if (canOpen) {
                await Linking.openURL(mailtoUrl);
            } else {
                Alert.alert('Email Not Available', 'Please ensure you have an email app configured on your device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open email client.');
        }
    };

    const handleWhatsAppSupport = async () => {
        const phoneNumber = '2347043065222';
        const whatsappUrl = `https://wa.me/${phoneNumber}`;

        try {
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
                await Linking.openURL(whatsappUrl);
            } else {
                Alert.alert('WhatsApp Not Available', 'Please ensure WhatsApp is installed on your device.');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open WhatsApp.');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                                Help & Support
                            </Text>
                            <Text style={[styles.modalSubtitle, isDark && styles.modalSubtitleDark]}>
                                We're here to help you
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contactOptionsContainer}>
                        <TouchableOpacity
                            style={[styles.contactOption, isDark && styles.contactOptionDark]}
                            onPress={handleEmailSupport}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#358B8B' }]}>
                                <Mail size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactLabel, isDark && styles.contactLabelDark]}>
                                    Email Support
                                </Text>
                                <Text style={[styles.contactValue, isDark && styles.contactValueDark]}>
                                    support@realvistaproperties.com
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.contactOption, isDark && styles.contactOptionDark]}
                            onPress={handleWhatsAppSupport}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#25D366' }]}>
                                <MessageCircle size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactLabel, isDark && styles.contactLabelDark]}>
                                    WhatsApp Support
                                </Text>
                                <Text style={[styles.contactValue, isDark && styles.contactValueDark]}>
                                    +234 704 306 5222
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.footer, isDark && styles.footerDark]}>
                        <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                            Our support team typically responds within 24 hours
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalContentDark: {
        backgroundColor: '#1F2937',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    modalTitleDark: {
        color: '#F9FAFB',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    modalSubtitleDark: {
        color: '#9CA3AF',
    },
    closeButton: {
        padding: 4,
    },
    contactOptionsContainer: {
        padding: 24,
        gap: 16,
    },
    contactOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactOptionDark: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    contactLabelDark: {
        color: '#F9FAFB',
    },
    contactValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    contactValueDark: {
        color: '#9CA3AF',
    },
    footer: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerDark: {
        backgroundColor: '#374151',
        borderTopColor: '#4B5563',
    },
    footerText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    footerTextDark: {
        color: '#9CA3AF',
    },
});
