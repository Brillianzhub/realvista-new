// app/search/_layout.tsx
import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const MarketLayout = () => {

    const { colors } = useTheme();

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />

            <Stack.Screen
                name="marketdetails"
                options={{
                    presentation: "card",
                    animation: "slide_from_right",
                    headerTitleAlign: "center",
                    title: "Property Details",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")}>
                            <Ionicons name="arrow-back" size={24} color="#358B8B" />
                        </TouchableOpacity>
                    ),
                }}
            />
            
            <Stack.Screen
                name="search"
                options={{
                    presentation: "card",
                    animation: "slide_from_right",
                    headerTitleAlign: "center",
                    title: "Filter Listings",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")}>
                            <Ionicons name="arrow-back" size={24} color="#358B8B" />
                        </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    );
};

const styles = StyleSheet.create({
    backButton: {
        paddingHorizontal: 12,
    },
});

export default MarketLayout;
