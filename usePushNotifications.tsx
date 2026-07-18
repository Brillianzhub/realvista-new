import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { setupNotificationChannels } from './notificationChannels';
import { useGlobalContext } from './context/GlobalProvider';
import api from './lib/apiClient';

export interface PushNotificationState {
    expoPushToken?: Notifications.ExpoPushToken;
    notification?: Notifications.Notification;
    enableNotifications: () => Promise<void>;
    disableNotifications: () => Promise<void>;
    getNotificationStatus: () => Promise<boolean>;
}


export const usePushNotifications = (): PushNotificationState => {
    const { user } = useGlobalContext();
    const userId = user?.id;

    const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken>();
    const [notification, setNotification] = useState<Notifications.Notification>();

    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    // Notifications.setNotificationHandler({
    //     handleNotification: async () => ({
    //         shouldPlaySound: false,
    //         shouldShowAlert: true,
    //         shouldSetBadge: false,
    //     }),
    // });


    try {
        Notifications.setNotificationHandler({
            handleNotification: async (notification) => {
                const { request } = notification;
                const { content } = request;
                const groupId = content.data?.groupId; // Access groupId from the data payload

                if (groupId) {
                    console.log(`Notification for groupId: ${groupId}`);
                    return {
                        shouldPlaySound: true,
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldSetBadge: true,
                    };
                }

                // Default behavior
                return {
                    shouldPlaySound: true,
                    shouldShowBanner: true,
                    shouldShowList: true,
                    shouldSetBadge: false,
                };
            },
        });
    } catch (error) {
        console.warn('Push notification handler setup failed:', error);
    }


    const registerForPushNotificationsAsync = async (): Promise<Notifications.ExpoPushToken | undefined> => {
        try {
            if (!Device.isDevice) {
                console.warn('Must be using a physical device for Push notifications');
                return;
            }

            if (Constants.appOwnership === 'expo') {
                console.log('Push notifications not supported in Expo Go');
                return;
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            const finalStatus = existingStatus === 'granted' ? existingStatus : (await Notifications.requestPermissionsAsync()).status;

            if (finalStatus !== 'granted') {
                console.error('Failed to get push token for notifications');
                return;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas.projectId,
            });

            if (!token) throw new Error('Failed to generate push token');

            await setupNotificationChannels();

            // Send the token to the backend
            await api.post('/api/notifications/register-token/', { token: token.data, user_id: userId });

            return token;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
        }
    };

    const enableNotifications = async () => {
        const token = await registerForPushNotificationsAsync();
        if (token) setExpoPushToken(token);
    };

    const disableNotifications = async () => {
        try {
            if (expoPushToken) {
                await api.post('/api/notifications/unregister-token/', { token: expoPushToken.data });
            }

            setExpoPushToken(undefined);
        } catch (error) {
            console.error('Error disabling notifications:', error);
        }
    };

    const getNotificationStatus = async (): Promise<boolean> => {
        return !!expoPushToken;
    };

    useEffect(() => {
        (async () => {
            try {
                await enableNotifications();
            } catch (error) {
                console.warn('Push notification setup failed:', error);
            }
        })();

        try {
            notificationListener.current = Notifications.addNotificationReceivedListener(setNotification);
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Notification Response:', response);
            });
        } catch (error) {
            console.warn('Push notification listener setup failed:', error);
        }

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    return {
        expoPushToken,
        notification,
        enableNotifications,
        disableNotifications,
        getNotificationStatus,
    };
};
