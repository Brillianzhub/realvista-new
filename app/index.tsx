import { StyleSheet, Text, View, Pressable, Image, Dimensions, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import PagerView from 'react-native-pager-view';
import images from '@/constants/images';


const { width, height } = Dimensions.get('window');

const dynamicFontSize = width < 380 ? 25 : 36;

const Index = () => {
    const router = useRouter();
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = 3;

    const messages = [
        "Grow your wealth, one property at a time.",
        "Real-time insights, real-time decisions. Act now.",
        "The future of real estate investment is here.",
    ];

    const handleSignUp = () => {
        router.push('/(auth)/account-type');
    };

    const handleLogin = () => {
        router.push('/(auth)/sign-in');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => {
                setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Text style={styles.welcomeTitle}>Welcome to Realvista</Text>
                <Animated.Text style={[styles.titleText, { opacity: fadeAnim }]}>
                    {messages[currentMessageIndex]}
                </Animated.Text>
            </View>

            <View style={styles.middleSection}>
                <PagerView
                    style={styles.pagerView}
                    initialPage={0}
                    onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
                >
                    <View key="1" style={styles.page}>
                        <Image
                            source={images.businessInvestor}
                            style={styles.middleImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View key="2" style={styles.page}>
                        <Image
                            source={images.businessSales}
                            style={styles.middleImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View key="3" style={styles.page}>
                        <Image
                            source={images.scooter}
                            style={styles.middleImage}
                            resizeMode="contain"
                        />
                    </View>
                </PagerView>
                <View style={styles.progressDots}>
                    {[...Array(totalPages)].map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentPage === index && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.bottomSection}>
                <Pressable onPress={handleSignUp} style={[styles.button, styles.signUpButton]}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </Pressable>
                <Pressable onPress={handleLogin} style={[styles.button, styles.loginButton]}>
                    <Text style={[styles.buttonText, { color: '#358B8B' }]}>Login</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Index;

const dynamicFlexSize = width < 380 ? 1.0 : 1.6

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topSection: {
        flex: dynamicFlexSize,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingBottom: height * 0.03,
    },
    welcomeTitle: {
        fontFamily: 'RobotoSerif-Regular',
        fontWeight: '600',
        fontSize: 18,
        color: '#358B8B',
        paddingHorizontal: width * 0.075,
    },
    titleText: {
        fontFamily: 'RobotoSerif-Regular',
        fontWeight: '400',
        fontSize: dynamicFontSize,
        color: '#358B8B',
        paddingHorizontal: width * 0.075,
    },
    middleSection: {
        flex: width < 380 ? 2 : 2.5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
    },
    pagerView: {
        width: '100%',
        height: '85%',
        borderRadius: 10
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleImage: {
        width: '85%',
        aspectRatio: width < 380 ? 0.5 : 0.75,
        resizeMode: 'contain',
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 50,
        backgroundColor: '#CCC',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: 'rgba(53, 139, 139, 1)',
        width: 15,
        height: 8,
        borderRadius: 50,
    },
    bottomSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.05,
    },
    button: {
        width: '90%',
        maxWidth: 400,
        padding: 10,
        borderRadius: 30,
        alignItems: 'center',
        marginVertical: 10,
    },
    signUpButton: {
        backgroundColor: '#FB902E',
        borderColor: '#FB902E',
        borderWidth: 3,
    },
    loginButton: {
        borderColor: '#FB902E',
        borderWidth: 3,
    },
    buttonText: {
        fontFamily: 'Abel-Regular',
        fontSize: 20,
        color: '#fff',
        fontWeight: '400',
    },
});
