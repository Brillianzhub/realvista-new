import { StyleSheet, Text, View, ActivityIndicator, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '@/utils/general/formatCurrency';

interface PaymentPlan {
    id: number;
    name: string;
    interest_rate: number;
}

interface PaymentPlansProps {
    actual_price: number;
    currency: string;
}

const PaymentPlans: React.FC<PaymentPlansProps> = ({ actual_price, currency }) => {
    const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPaymentPlans = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken'); // Retrieve token

                if (!token) {
                    console.error('No authentication token found');
                    return;
                }

                const response = await fetch(
                    'https://realvistamanagement.com/purchases/payment-plans/',
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Token ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: PaymentPlan[] = await response.json();
                setPaymentPlans(data);
            } catch (error) {
                console.error('Error fetching payment plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentPlans();
    }, []);

    // Function to calculate new price based on interest rate
    const calculateNewPrice = (interestRate: number): number => {
        return Number((actual_price * (1 + interestRate / 100)).toFixed(2));
    };


    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <FlatList
                    data={paymentPlans}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                    renderItem={({ item }) => (
                        <View style={styles.planCard}>
                            <Text style={styles.planName}>{item.name.replace('_', ' ')}</Text>
                            <Text style={styles.newPrice}>
                                {formatCurrency(calculateNewPrice(item.interest_rate), currency)}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

export default PaymentPlans;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 16,
    },
    planCard: {
        padding: 12,
        marginHorizontal: 10,
        marginVertical: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        elevation: 2,
        alignItems: 'center',
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    planDetails: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginTop: 4,
    },
    newPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
        marginTop: 5,
    },
    scrollContainer: {
        paddingHorizontal: 10,
    },
});
