import {
    StyleSheet, Text, View, Image, ScrollView, Alert, Linking, Share,
    Button, Platform, ActivityIndicator, Dimensions
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { TouchableOpacity } from 'react-native';
import images from '@/constants/images';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '@/utils/general/formatCurrency';
import usePortfolioDetail from '@/hooks/portfolio/usePortfolioDetail';
import { useTheme } from '@/context/ThemeContext';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';
import SubmitReferralModal from '@/components/profile/SubmitReferralModal';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';


// Define types
interface User {
    name?: string;
    first_name?: string;
    auth_provider?: string;
    referral_code?: string;
    referrer?: string;
    referred_users_count?: number;
    total_referral_earnings?: number;
    profile: {
        avatar?: string;
    };
}

interface Summary {
    totalCurrentValue: number;
    totalIncome: number;
    totalExpenses: number;
}

interface PortfolioResult {
    personal_summary?: Summary;
    group_summary?: Summary;
    overall_summary?: Summary;
}

interface PortfolioDetailHook {
    result: PortfolioResult | null;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    currency: string;
    fetchPortfolioDetails: () => void;
}

const Profile = (): React.JSX.Element => {
    const { user, setIsLogged, setUser } = useGlobalContext();
    const { colors } = useTheme();
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [refModalVisible, setRefModalVisible] = useState<boolean>(false);

    const { result, loading, setLoading, currency, fetchPortfolioDetails }: PortfolioDetailHook = usePortfolioDetail();

    const personalSummary: Summary | undefined = result?.personal_summary;
    const groupSummary: Summary | undefined = result?.group_summary;
    const overallSummary: Summary | undefined = result?.overall_summary;

    const personalAccountNet: number = (personalSummary?.totalCurrentValue || 0) +
        (personalSummary?.totalIncome || 0) -
        (personalSummary?.totalExpenses || 0);

    const groupAccountNet: number = (groupSummary?.totalCurrentValue || 0) +
        (groupSummary?.totalIncome || 0) -
        (groupSummary?.totalExpenses || 0);

    const overallAccountNet: number = (overallSummary?.totalCurrentValue || 0) +
        (overallSummary?.totalIncome || 0) -
        (overallSummary?.totalExpenses || 0);

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

    const handleShare = async (): Promise<void> => {
        try {
            const result = await Share.share({
                message: 'Manage your properties with Realvista App. It makes real estate investment/management simple and efficient. Get it now: https://play.google.com/store/apps/details?id=com.brillianzhub.realvista',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('App shared successfully!');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed.');
            }
        } catch (error) {
            console.error('Error sharing the app:', error);
        }
    };

    const handleRateUs = async (): Promise<void> => {
        const appStoreUrl = 'https://apps.apple.com/app/idYOUR_APP_ID';
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.brillianzhub.realvista';

        try {
            const storeUrl = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
            const supported = await Linking.canOpenURL(storeUrl);

            if (supported) {
                await Linking.openURL(storeUrl);
            } else {
                Alert.alert(
                    'Error',
                    'Unable to open the app store. Please try again later.'
                );
            }
        } catch (error) {
            console.error('Error opening store:', error);
            Alert.alert('Error', 'An error occurred. Please try again.');
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

    const changePlan = (): void => {
        Linking.openURL('https://realvistaproperties.com/pricing').catch((err) =>
            console.error('An error occurred while opening the URL', err)
        );
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#358B8B" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>

                <TouchableOpacity style={styles.imageContainer}>
                    {user?.profile.avatar ? (
                        <Image source={{ uri: user.profile.avatar }} style={styles.avatar} />
                    ) : (
                        <Text style={{ textAlign: 'center' }}>Profile Picture</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.userNameView}>
                    <Text style={styles.userName}>
                        {user?.name && user?.first_name ? `${user.name} ${user.first_name}` : user?.name || user?.first_name}
                    </Text>
                </View>

                <View style={styles.portfolioSummary}>
                    <View style={styles.portfolioNet}>
                        <Text style={styles.portfolioNetText}>Net Worth</Text>
                        <Text style={[styles.portfolioItemText, { color: 'gray', fontWeight: 'normal', fontSize: 14 }]}>
                            Total Current Value + Total Income - Total Expenses
                        </Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioItemText}>Personal Account</Text>
                        <Text style={[styles.portfolioItemText, { color: '#FB902E' }]}>
                            {formatCurrency(personalAccountNet, currency)}
                        </Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioItemText}>Investment Account</Text>
                        <Text style={[styles.portfolioItemText, { color: '#FB902E' }]}>
                            {formatCurrency(groupAccountNet, currency)}
                        </Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioItemText}>Total</Text>
                        <Text style={[styles.portfolioItemText, { color: '#FB902E' }]}>
                            {formatCurrency(overallAccountNet, currency)}
                        </Text>
                    </View>
                </View>

                <View style={styles.portfolioSummary}>
                    <View style={styles.portfolioNet}>
                        <Text style={styles.portfolioNetText}>Basic Info</Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <TouchableOpacity
                            onPress={() =>
                                Linking.openURL('https://www.realvistaproperties.com/about-us')
                            }
                        >
                            <Text style={styles.portfolioItemText}>About us</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.portfolioItem}>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:contact@realvistaproperties.com')}>
                            <Text style={styles.portfolioItemText}>Contact us</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.portfolioItem}>
                        <TouchableOpacity onPress={handleShare}>
                            <Text style={styles.portfolioItemText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.portfolioItem}>
                        <TouchableOpacity onPress={handleRateUs}>
                            <Text style={styles.portfolioItemText}>Rate us</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.portfolioSummary}>
                    <View style={styles.portfolioNet}>
                        <Text style={styles.portfolioNetText}>Custom settings</Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <TouchableOpacity onPress={() => router.replace('/(app)/(manage)/Settings')}>
                            <Text style={styles.portfolioItemText}>Set currency</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.portfolioSummary}>
                    <View style={styles.portfolioNet}>
                        <Text style={styles.portfolioNetText}>Referral Details</Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioKey}>Referral code:</Text>
                        <TouchableOpacity
                            onPress={handleCopyReferralCode}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Text style={{ color: '#358B8B', fontSize: 16, marginRight: 5 }}>
                                {user?.referral_code}
                            </Text>
                            <Ionicons name="copy-outline" size={20} color="#358B8B" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioKey}>Referrer:</Text>
                        <Text style={styles.portfolioValue}>{user?.referrer}</Text>
                    </View>
                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioKey}>No. of Referrals:</Text>
                        <Text style={styles.portfolioValue}>{user?.referred_users_count}</Text>
                    </View>

                    <View style={styles.portfolioItem}>
                        <Text style={styles.portfolioKey}>Referral earnings:</Text>
                        <Text style={styles.portfolioValue}>
                            {formatCurrency(user?.total_referral_earnings || 0, currency)}
                        </Text>
                    </View>

                    {!user?.referrer && (
                        <TouchableOpacity
                            style={{ alignItems: 'center', backgroundColor: '#FB902E', padding: 12, borderRadius: 25, marginVertical: 10 }}
                            onPress={() => setRefModalVisible(true)}
                        >
                            <Text style={{ color: 'white' }}>Enter Referral Code</Text>
                        </TouchableOpacity>
                    )}
                    <SubmitReferralModal visible={refModalVisible} onClose={() => setRefModalVisible(false)} />
                </View>

                <View style={styles.portfolioSummary}>
                    <View style={styles.portfolioNet}>
                        <Text style={styles.portfolioNetText}>Personal details</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.portfolioItem}
                        onPress={() => router.replace('/update-profile')}
                    >
                        <Text style={styles.portfolioItemText}>Update profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.portfolioItem}
                        onPress={() => router.replace('/change-password')}
                    >
                        <Text style={styles.portfolioItemText}>Change password</Text>
                    </TouchableOpacity>
                    <View style={styles.portfolioItem}>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Text style={[styles.portfolioItemText, { color: 'red' }]}>Delete account</Text>
                        </TouchableOpacity>
                    </View>

                    <DeleteAccountModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                    />
                </View>

                <View style={styles.portfolioSummary}>
                    <TouchableOpacity onPress={logout}>
                        <Image
                            source={images.logout}
                            style={{ height: 24, width: 24, marginTop: 20 }}
                        />
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
};

export default Profile;

const { width: screenWidth } = Dimensions.get('window');

const dynamicFontSize = screenWidth < 380 ? 18 : 20;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50
    },
    userNameView: {
        marginVertical: 10,
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center'
    },
    portfolioSummary: {
        paddingBottom: 10,
    },
    portfolioNet: {
        marginTop: 30,
    },
    portfolioNetText: {
        fontSize: dynamicFontSize,
        fontWeight: 'bold'
    },
    portfolioItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },

    portfolioKey: {
        fontSize: 16,
        color: "#666",
        flex: 1,
    },
    portfolioValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        textAlign: "right",
    },
    portfolioItemText: {
        fontSize: 15,
        fontWeight: '600',
    },
    notificationsViewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10
    },
    notificationsPoint: {
        height: 8,
        width: 8,
        borderRadius: 50,
        backgroundColor: '#358B8B'
    },
    notificationsDate: {
        color: 'gray'
    },
    handleContainer: {
        backgroundColor: '#358B8B1A',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    handleIndicator: {
        backgroundColor: '#136e8b',
        width: 50,
        height: 5,
        borderRadius: 3,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
    },

})
