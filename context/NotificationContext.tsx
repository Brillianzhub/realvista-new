import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define notification type
export type AppNotification = {
    id: string;
    title?: string | null;
    body?: string | null;
    data?: Record<string, any>;
    read?: boolean;
};


// Define context type
type NotificationContextType = {
    notifications: AppNotification[];
    setNotifications: Dispatch<SetStateAction<AppNotification[]>>;
    hasUnread: boolean;
    markNotificationsAsRead: () => Promise<void>;
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

// Hook
export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
};

// Props for provider
type NotificationProviderProps = {
    children: ReactNode;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [hasUnread, setHasUnread] = useState<boolean>(false);

    // Load stored notifications on mount
    useEffect(() => {
        const loadStoredNotifications = async () => {
            try {
                const storedNotifications = await AsyncStorage.getItem("notifications");
                if (storedNotifications) {
                    const parsed: AppNotification[] = JSON.parse(storedNotifications);
                    setNotifications(parsed);

                    // Check for unread
                    const unreadExists = parsed.some((n) => !n.read);
                    setHasUnread(unreadExists);
                }
            } catch (error) {
                console.error("Failed to load notifications from storage:", error);
            }
        };

        loadStoredNotifications();
    }, []);

    // Mark all as read
    const markNotificationsAsRead = async () => {
        const updated = notifications.map((n) => ({
            ...n,
            read: true,
        }));

        setNotifications(updated);
        setHasUnread(false);

        try {
            await AsyncStorage.setItem("notifications", JSON.stringify(updated));
        } catch (error) {
            console.error("Failed to update notifications in storage:", error);
        }
    };

    // Save notifications whenever they change
    useEffect(() => {
        const saveNotifications = async () => {
            try {
                await AsyncStorage.setItem(
                    "notifications",
                    JSON.stringify(notifications)
                );
            } catch (error) {
                console.error("Failed to save notifications to storage:", error);
            }
        };

        if (notifications.length > 0) {
            saveNotifications();
        }
    }, [notifications]);

    // Setup listeners for notifications
    useEffect(() => {
        const subscription =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Notification received in foreground:", notification);

                setNotifications((prev) => [
                    ...prev,
                    {
                        id: notification.request.identifier,
                        title: notification.request.content.title,
                        body: notification.request.content.body,
                        data: notification.request.content.data,
                        read: false,
                    },
                ]);
            });

        const responseSubscription =
            Notifications.addNotificationResponseReceivedListener((response) => {
                console.log("User interacted with the notification:", response);
                const notification = response.notification;

                setNotifications((prev) => [
                    ...prev,
                    {
                        id: notification.request.identifier,
                        title: notification.request.content.title,
                        body: notification.request.content.body,
                        data: notification.request.content.data,
                        read: false,
                    },
                ]);
            });

        return () => {
            subscription.remove();
            responseSubscription.remove();
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{ notifications, setNotifications, hasUnread, markNotificationsAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
