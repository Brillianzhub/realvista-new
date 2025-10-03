// ThemeContext.tsx
import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";

// Define theme types
type ThemeType = "light" | "dark";

// Define the shape of Colors (update if your Colors object has more keys)
type ColorScheme = typeof Colors.light;

// Define context value type
interface ThemeContextProps {
    theme: ThemeType;
    toggleTheme: () => void;
    colors: ColorScheme;
}

// Create context with default (null to force provider use)
const ThemeContext = createContext<ThemeContextProps | null>(null);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState<ThemeType>(colorScheme || "light");

    useEffect(() => {
        if (colorScheme) {
            setTheme(colorScheme as ThemeType);
        }
    }, [colorScheme]);

    const toggleTheme = () => {
        const newTheme: ThemeType = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    const currentColors = Colors[theme];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors: currentColors }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook with type safety
export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
