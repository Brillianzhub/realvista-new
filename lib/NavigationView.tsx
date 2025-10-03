import React, { FC } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
    Linking,
    ScrollView,
    GestureResponderEvent,
} from 'react-native';
import { router } from 'expo-router';
import images from '../constants/images';
import SocialMediaHandle from '../components/SocialMediaHandle';

// Props type for Image with source from constants
interface MenuItemProps {
    onPress: (event: GestureResponderEvent) => void;
    image: ImageSourcePropType;
    label: string;
}

const MenuItem: FC<MenuItemProps> = ({ onPress, image, label }) => (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
        <Image source={image} style={styles.menuImg} />
        <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
);

const NavigationView: FC = () => {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Logo */}
                <View style={styles.logoView}>
                    <Image source={images.logo} style={styles.logo} resizeMode="contain" />
                </View>

                {/* Menu Items */}
                <MenuItem
                    onPress={() => router.push({ pathname: '/(manage)/manage' })}
                    image={images.manage}
                    label="Manage Properties"
                />

                <MenuItem
                    onPress={() => router.push({ pathname: '/(manage)/profile' })}
                    image={images.profile}
                    label="Profile"
                />

                <MenuItem
                    onPress={() => router.push('Bookmarks')}
                    image={images.wishList}
                    label="Favorite Collections"
                />

                <MenuItem
                    onPress={() =>
                        Linking.openURL(
                            'https://www.realvistaproperties.com/frequently-asked-questions'
                        )
                    }
                    image={images.faq}
                    label="FAQ"
                />

                <MenuItem
                    onPress={() =>
                        Linking.openURL('mailto:support@realvistaproperties.com')
                    }
                    image={images.support}
                    label="Support"
                />

                <MenuItem
                    onPress={() =>
                        Linking.openURL(
                            'https://wa.me/+2347043065222?text=Hello, I need support!'
                        )
                    }
                    image={images.whatsapp}
                    label="WhatsApp Support"
                />

                <MenuItem
                    onPress={() =>
                        Linking.openURL('https://www.realvistaproperties.com/privacy-policy')
                    }
                    image={images.privacyPolicy}
                    label="Privacy Policy"
                />

                <MenuItem
                    onPress={() =>
                        Linking.openURL('https://www.realvistaproperties.com/terms')
                    }
                    image={images.termsUse}
                    label="Terms of Use"
                />

                {/* Social Media Handles */}
                <SocialMediaHandle />
            </ScrollView>
        </View>
    );
};

export default NavigationView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', // Center content vertically
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1, // Ensures the ScrollView can scroll
        justifyContent: 'center', // Center content vertically inside ScrollView
        padding: 20,
    },
    logoView: {
        alignItems: 'center', // Center the logo horizontally
        marginBottom: 20,
    },
    logo: {
        width: 214,
        height: 48,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        gap: 10,
    },
    menuText: {
        fontSize: 18,
        color: '#358B8B',
    },
    menuImg: {
        height: 24,
        width: 24,
    },
});
