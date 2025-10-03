import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    username: string;
    email: string;
    // Add more fields if your API returns them
    [key: string]: any;
}

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
            throw new Error('No token found in AsyncStorage');
        }

        const response = await fetch(
            'https://www.realvistamanagement.com/accounts/current-user/',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch current user. Status: ${response.status}`
            );
        }

        const userData: User = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
};
