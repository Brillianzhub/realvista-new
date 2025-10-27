// app/search/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";


const ListingsLayout = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const colors = {
        background: isDark ? "#111827" : "#FFFFFF",
        tint: isDark ? "#F9FAFB" : "#111827",
        iconColor: isDark ? "#FB902E" : "#358B8B",
    };

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.background,
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
                        title: "Manage Listings",
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")}>
                                <Ionicons name="arrow-back" size={24} color={colors.iconColor} />
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
                                <Ionicons name="arrow-back" size={24} color={colors.iconColor} />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="update-listing"
                    options={{
                        presentation: "card",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        title: "Update Listing",
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color={colors.iconColor} />
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Stack>
        </>
    );
};

export default ListingsLayout;
