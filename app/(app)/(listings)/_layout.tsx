// app/search/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { initWatchedTable } from "@/src/database/watchedVideosDB";

const ListingsLayout = () => {

    useEffect(() => {
        initWatchedTable();
    }, []);

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
                    title: "Manage Listings",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")}>
                            <Ionicons name="arrow-back" size={24} color="#358B8B" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="listing-workflow"
                options={{
                    presentation: "card",
                    animation: "slide_from_right",
                    headerTitleAlign: "center",
                    title: "Listing Workflow",
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
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

export default ListingsLayout;
