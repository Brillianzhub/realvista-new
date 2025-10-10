import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Alert,
    Linking,
    Share,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import axios from 'axios';
import { formatCurrency } from '@/utils/general/formatCurrency';
// import usePortfolioDetail from '@/hooks/usePortfolioDetail';


type UserProfile = {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    referral_code?: string;
    referrer?: string;
    referred_users_count: number;
    total_referral_earnings: number;
};

type PortfolioSummary = {
    totalCurrentValue: number;
    totalIncome: number;
    totalExpenses: number;
};

export default function Profile() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(false);
    const { user, setUser, setIsLogged } = useGlobalContext();
    const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
        totalCurrentValue: 0,
        totalIncome: 0,
        totalExpenses: 0,
    });



    // const formatCurrency = (amount: number): string => {
    //     return new Intl.NumberFormat('en-NG', {
    //         style: 'currency',
    //         currency: 'NGN',
    //         minimumFractionDigits: 0,
    //         maximumFractionDigits: 0,
    //     }).format(amount);
    // };

    const netWorth =
        portfolioSummary.totalCurrentValue +
        portfolioSummary.totalIncome -
        portfolioSummary.totalExpenses;


    const handleShare = async () => {
        try {
            await Share.share({
                message:
                    'Manage your properties with Realvista App. Get it now: https://play.google.com/store/apps/details?id=com.brillianzhub.realvista',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleRateUs = async () => {
        const playStoreUrl =
            'https://play.google.com/store/apps/details?id=com.brillianzhub.realvista';
        const appStoreUrl = 'https://apps.apple.com/app/idYOUR_APP_ID';

        try {
            const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch (error) {
            console.error('Error opening store:', error);
        }
    };

    const signOut = async (): Promise<boolean> => {
        try {
            const response = await axios.post(
                'https://www.realvistamanagement.com/accounts/logout/'
            );
            if (response.status === 200) {
                return true;
            } else {
                console.error("Failed to log out");
                return false;
            }
        } catch (error) {
            Alert.alert('Logout Error', 'Failed to logout. Please try again.');
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            if (user?.auth_provider === 'email') {
                const success = await signOut();
                if (!success) return;
            }
            await AsyncStorage.removeItem('authToken');
            setUser(null);
            setIsLogged(false);
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Logout Error', error);
        }
    };

    const handleCopyReferralCode = async (): Promise<void> => {
        if (user?.referral_code) {
            await Clipboard.setStringAsync(user.referral_code);
            Alert.alert('Copied!', 'Referral code has been copied to your clipboard.');
        } else {
            Alert.alert('Error', 'No referral code available.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, isDark && styles.centeredDark]}>
                <ActivityIndicator size="large" color="#FB902E" />
                <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, isDark && styles.containerDark]}
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient
                // colors={['#70a9a9', '#358B8B']}
                colors={['#efa968', '#358B8B']}

                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.avatarContainer}>
                    {user?.profile ? (
                        <Image source={{ uri: user.profile.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={48} color="#FFFFFF" />
                        </View>
                    )}
                </View>
                <Text style={styles.userName}>
                    {user?.first_name || user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={[styles.card, isDark && styles.cardDark]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet-outline" size={24} color="#358B8B" />
                        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                            Net Worth
                        </Text>
                    </View>
                    <Text style={[styles.netWorthAmount, isDark && styles.netWorthAmountDark]}>
                        {formatCurrency(netWorth, 'NGN')}
                    </Text>
                    <Text style={[styles.netWorthSubtext, isDark && styles.netWorthSubtextDark]}>
                        Total Value + Income - Expenses
                    </Text>
                </View>

                <View style={[styles.card, isDark && styles.cardDark]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="people-outline" size={24} color="#358B8B" />
                        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                            Referral Details
                        </Text>
                    </View>

                    <View style={styles.referralRow}>
                        <Text style={[styles.referralLabel, isDark && styles.referralLabelDark]}>
                            Referral Code
                        </Text>
                        <TouchableOpacity
                            onPress={handleCopyReferralCode}
                            style={styles.referralCodeContainer}
                        >
                            <Text style={styles.referralCode}>{user?.referral_code}</Text>
                            <Ionicons name="copy-outline" size={20} color="#358B8B" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.referralRow}>
                        <Text style={[styles.referralLabel, isDark && styles.referralLabelDark]}>
                            Referrals
                        </Text>
                        <Text style={[styles.referralValue, isDark && styles.referralValueDark]}>
                            {user?.referred_users_count || 0}
                        </Text>
                    </View>

                    <View style={styles.referralRow}>
                        <Text style={[styles.referralLabel, isDark && styles.referralLabelDark]}>
                            Earnings
                        </Text>
                        <Text style={[styles.referralValue, isDark && styles.referralValueDark]}>
                            {formatCurrency(user?.total_referral_earnings || 0, 'NGN')}
                        </Text>
                    </View>
                </View>

                <View style={[styles.card, isDark && styles.cardDark]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="settings-outline" size={24} color="#358B8B" />
                        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                            Settings
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons
                            name="person-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            Update Profile
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            Change Password
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons
                            name="cash-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            Set Currency
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, isDark && styles.cardDark]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="information-circle-outline" size={24} color="#358B8B" />
                        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                            About
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Linking.openURL('https://www.realvistaproperties.com/about')}
                    >
                        <Ionicons
                            name="business-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            About Us
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Linking.openURL('mailto:contact@realvistaproperties.com')}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            Contact Us
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                        <Ionicons
                            name="share-social-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            Share App
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleRateUs}>
                        <Ionicons
                            name="star-outline"
                            size={20}
                            color={isDark ? '#E5E7EB' : '#6B7280'}
                        />
                        <Text style={[styles.menuItemText, isDark && styles.menuItemTextDark]}>
                            Rate Us
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#D1D5DB'}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.signOutButton, isDark && styles.signOutButtonDark]}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                        Realvista Properties
                    </Text>
                    <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
                        Version 1.0.0
                    </Text>
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
    containerDark: {
        backgroundColor: '#111827',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    centeredDark: {
        backgroundColor: '#111827',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    loadingTextDark: {
        color: '#9CA3AF',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        padding: 16,
        marginTop: -20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: '#1F2937',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    cardTitleDark: {
        color: '#F9FAFB',
    },
    netWorthAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FB902E',
        marginBottom: 4,
    },
    netWorthAmountDark: {
        color: '#FB902E',
    },
    netWorthSubtext: {
        fontSize: 14,
        color: '#6B7280',
    },
    netWorthSubtextDark: {
        color: '#9CA3AF',
    },
    referralRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    referralLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    referralLabelDark: {
        color: '#9CA3AF',
    },
    referralCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    referralCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FB902E',
    },
    referralValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    referralValueDark: {
        color: '#F9FAFB',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    menuItemTextDark: {
        color: '#E5E7EB',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    signOutButtonDark: {
        backgroundColor: '#1F2937',
        borderColor: '#7F1D1D',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    footerTextDark: {
        color: '#6B7280',
    },
});
