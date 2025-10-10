// app/search/_layout.tsx
import React, { useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const CalculatorLayout = () => {

    const { colors } = useTheme();

    const handleBackPress = useCallback(() => {
        router.replace("/(app)/(tabs)");
        return true;
    }, [router]);

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontFamily: "RobotoSerif-SemiBold",
                },
                headerTintColor: colors.tint,
            }}
        >

            <Stack.Screen
                name="index"
                options={{
                    presentation: "card",
                    animation: "slide_from_right",
                    headerTitleAlign: "center",
                    title: "Savings Targets",
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

export default CalculatorLayout;
