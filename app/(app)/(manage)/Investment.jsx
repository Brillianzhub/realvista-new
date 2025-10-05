import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';


const Investment = () => {
    const handleContactPress = () => {
        const contactEmail = 'realinvest@realvistaproperties.com';
        const subject = 'Interest in RealInvest Program';
        const body = 'Hello, I am interested in learning more about the RealInvest program.';
        const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.openURL(mailto).catch((err) => {
            console.error('An error occurred', err);
            Alert.alert(
                'Error',
                'Unable to open email client. Please ensure you have a mail application installed on your device.'
            );
        });
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <MaterialIcons name="real-estate-agent" size={40} color="#FB902E" />
                <Text style={styles.title}>RealInvest</Text>
            </View>

            <View style={[styles.card, { alignItems: 'center' }]}>
                <MaterialIcons name="business" size={24} color="#FB902E" />
                <Text style={[styles.description, { textAlign: 'center' }]}>
                    Let’s unlock the power of community wealth building together.
                </Text>
            </View>

            <Text style={styles.subtitle}>Why Join the RealInvest Program?</Text>
            <View style={styles.card}>
                <View style={styles.benefitItem}>
                    <FontAwesome name="users" size={24} color="#FB902E" />
                    <Text style={styles.benefitText}>Collaborate with like-minded investors</Text>
                </View>
                <View style={styles.benefitItem}>
                    <MaterialCommunityIcons name="home-city" size={24} color="#FB902E" />
                    <Text style={styles.benefitText}>Access high-value real estate projects</Text>
                </View>
                <View style={styles.benefitItem}>
                    <MaterialIcons name="attach-money" size={24} color="#FB902E" />
                    <Text style={styles.benefitText}>Enjoy shared risk and increased returns</Text>
                </View>
                <View style={styles.benefitItem}>
                    <MaterialIcons name="verified" size={24} color="#FB902E" />
                    <Text style={styles.benefitText}>Be part of a transparent and trustworthy investment community</Text>
                </View>
            </View>

            {/* Footer Section */}
            <View style={styles.card}>
                <Text style={styles.footer}>
                    Interested in learning more? Click the button below to contact us and find out how you can join the program.
                </Text>
                <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                    <Text style={styles.contactButtonText}>Contact Us</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default Investment;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
    headCard: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 10,

    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
    },
    headDescription: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    benefitText: {
        fontSize: 16,
        color: '#555',
        marginLeft: 10,
        flex: 1,
    },
    footer: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        lineHeight: 24,
        textAlign: 'center',
    },
    contactButton: {
        backgroundColor: '#FB902E',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});