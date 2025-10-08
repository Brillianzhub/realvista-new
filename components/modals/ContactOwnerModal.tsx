import React, { useRef, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    PanResponder,
    StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Owner {
    owner_name: string;
    email: string;
    phone_number: string;
    contact_by_email: boolean;
    contact_by_whatsapp: boolean;
    contact_by_phone: boolean;
}

interface ContactOwnerModalProps {
    visible: boolean;
    onClose: () => void;
    owner: Owner;
    onContactMethod: (method: "whatsapp" | "email" | "phone") => void;
}

const ContactOwnerModal: React.FC<ContactOwnerModalProps> = ({
    visible,
    onClose,
    owner,
    onContactMethod,
}) => {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : 300,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) onClose();
                else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    type ContactOption = {
        method: "whatsapp" | "email" | "phone";
        label: string;
        value: string;
        icon: string;
        color: string;
    };

    const contactOptions: ContactOption[] = [
        ...(owner.contact_by_whatsapp
            ? [{
                method: "whatsapp" as const,
                label: "WhatsApp",
                value: owner.phone_number,
                icon: "logo-whatsapp",
                color: "#25D366",
            }]
            : []),
        ...(owner.contact_by_email
            ? [{
                method: "email" as const,
                label: "Email",
                value: owner.email,
                icon: "mail",
                color: "#3B82F6",
            }]
            : []),
        ...(owner.contact_by_phone
            ? [{
                method: "phone" as const,
                label: "Phone Call",
                value: owner.phone_number,
                icon: "call",
                color: "#14B8A6",
            }]
            : []),
    ];



    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.dragHandleContainer}>
                        <View style={styles.dragHandle} />
                    </View>

                    <View style={styles.bottomSheetContent}>
                        <Text style={styles.modalTitle}>
                            Contact {owner.owner_name}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            Choose your preferred method
                        </Text>

                        <View style={styles.contactOptions}>
                            {contactOptions.length > 0 ? (
                                contactOptions.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.contactOption}
                                        onPress={() =>
                                            onContactMethod(option.method)
                                        }
                                    >
                                        <View
                                            style={[
                                                styles.contactIconCircle,
                                                { backgroundColor: option.color },
                                            ]}
                                        >
                                            <Ionicons
                                                name={option.icon as any}
                                                size={28}
                                                color="#FFFFFF"
                                            />
                                        </View>
                                        <View style={styles.contactOptionInfo}>
                                            <Text style={styles.contactOptionLabel}>
                                                {option.label}
                                            </Text>
                                            <Text
                                                style={styles.contactOptionValue}
                                                numberOfLines={1}
                                            >
                                                {option.value}
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.noContactText}>
                                    This owner has not enabled any contact method.
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={onClose}
                        >
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default ContactOwnerModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        maxHeight: '80%',
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#D1D5DB',
        borderRadius: 3,
    },
    bottomSheetContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    contactOptions: {
        gap: 12,
        marginBottom: 20,
    },
    contactOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    contactIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactOptionInfo: {
        flex: 1,
    },
    contactOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    contactOptionValue: {
        fontSize: 13,
        color: '#6B7280',
    },
    modalCloseButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    noContactText: {
        textAlign: "center",
        color: "#9CA3AF",
        fontStyle: "italic",
        marginVertical: 20,
    },
})