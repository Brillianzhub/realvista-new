import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNotifications } from '@/context/NotificationContext';

const Notifications = () => {
    const { notifications, markNotificationsAsRead, setNotifications } = useNotifications();

    useEffect(() => {
        markNotificationsAsRead();
    }, []);

    useEffect(() => {
        if (notifications.length > 30) {
            setNotifications(prev => prev.slice(0, 30));
        }
    }, [notifications.length]);

    const filteredNotifications = notifications.filter(
        item => item?.id !== null && item?.title !== null
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            <FlatList
                data={[...filteredNotifications].reverse()}
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.notification}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.body}>{item.body}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No notifications to show</Text>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    notification: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        fontSize: 14,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default Notifications;