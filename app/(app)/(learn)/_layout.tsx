// app/search/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { initWatchedTable } from "@/src/database/watchedVideosDB";

const LearnLayout = () => {

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    useEffect(() => {
        initWatchedTable();
    }, []);

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
                        backgroundColor: colors.background
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
                        title: "Expert Learn",
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)")}>
                                <Ionicons name="arrow-back" size={24} color="#358B8B" />
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Stack.Screen
                    name="[slug]"
                    options={{
                        presentation: "card",
                        animation: "slide_from_right",
                        headerTitleAlign: "center",
                        title: "Expert Learn",
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color="#358B8B" />
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Stack>
        </>
    );
};


export default LearnLayout;
