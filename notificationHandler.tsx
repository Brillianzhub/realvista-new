import * as Notifications from 'expo-notifications';

export const configureNotificationHandlers = () => {
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
            // For group chats, handle them differently (bundled notifications)
            const { groupId } = notification.request.content.data || {};

            if (groupId) {
                // Optionally, you could show the notifications in a grouped way or update the badge count.
                return {
                    shouldPlaySound: true,
                    shouldShowAlert: true,
                    shouldSetBadge: true,
                };
            }

            // Default behavior for general notifications
            return {
                shouldPlaySound: true,
                shouldShowAlert: true,
                shouldSetBadge: false,
            };
        },
    });

};
