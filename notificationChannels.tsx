import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


export const setupNotificationChannels = async () => {
    if (Platform.OS === 'android') {
        // General notification channel
        await Notifications.setNotificationChannelAsync('general', {
            name: 'General Notifications',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });

        // Group chat notification channel with bundling
        await Notifications.setNotificationChannelAsync('group-chat', {
            name: 'Group Chat Notifications',
            importance: Notifications.AndroidImportance.HIGH,
            groupId: 'group-chat',
            vibrationPattern: [0, 500, 500, 500],
            lightColor: '#FF4500',
        });
    }

    // if (Platform.OS === 'android') {
    //     await Notifications.setNotificationChannelAsync('default', {
    //         name: 'default',
    //         importance: Notifications.AndroidImportance.MAX,
    //         vibrationPattern: [0, 250, 250, 250],
    //         lightColor: '#FF231F7C',
    //     });
    // }
};
