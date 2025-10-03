import { Slot } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, RobotoSerif_400Regular, RobotoSerif_500Medium, RobotoSerif_700Bold } from '@expo-google-fonts/roboto-serif';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/context/ThemeContext';
import GlobalProvider from '@/context/GlobalProvider';
import { InvestmentProvider } from '@/context/InvestmentContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ProjectsProvider } from '@/context/ProjectsContext';
import { useTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => { });

function InnerApp() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        backgroundColor={theme === "dark" ? "#000" : "#fff"}
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme === "dark" ? "#000" : "#fff" }}>
        <Slot />
      </SafeAreaView>
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    "RobotoSerif-Regular": RobotoSerif_400Regular,
    "RobotoSerif-Medium": RobotoSerif_500Medium,
    "RobotoSerif-Bold": RobotoSerif_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#358B8B" />
      </SafeAreaView>
    );
  }


  return (
    <ThemeProvider>
      <GlobalProvider>
        <InvestmentProvider>
          <ProjectsProvider>
            <NotificationProvider>
              <CurrencyProvider>
                <InnerApp />
              </CurrencyProvider>
            </NotificationProvider>
          </ProjectsProvider>
        </InvestmentProvider>
      </GlobalProvider>
    </ThemeProvider>
  );
}
