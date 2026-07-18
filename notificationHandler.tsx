import * as Notifications from 'expo-notifications';

export const configureNotificationHandlers = () => {
    try {
        Notifications.setNotificationHandler({
            handleNotification: async (notification) => {
                // For group chats, handle them differently (bundled notifications)
                const { groupId } = notification.request.content.data || {};

                if (groupId) {
                    // Optionally, you could show the notifications in a grouped way or update the badge count.
                    return {
                        shouldPlaySound: true,
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldSetBadge: true,
                    };
                }

                // Default behavior for general notifications
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
};
