// app/search/_layout.tsx
import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const EstimatorLayout = () => {

    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.background
                },
                headerTintColor: colors.tint,
                // headerTitleStyle: {
                //     fontFamily: "Garamond_Medium",
                //     fontSize: 22,
                //     color: colors.text.primary,
                // },

            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    presentation: "card",
                    animation: "slide_from_right",
                    headerTitleAlign: "center",
                    title: "Estimate Property Value",
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

export default EstimatorLayout;
