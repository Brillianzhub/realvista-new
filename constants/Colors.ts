const tintColorLight = "#358B8B";
const tintColorDark = "#358B8B";

export const Colors = {
  light: {
    background: {
      primary: "#ffffff",   // main app background
      secondary: "#f9fafb", // cards, sections, panels
    },

    text: {
      primary: "#11181C",
      secondary: "#4b5563",
      muted: "#9ca3af",
      error: "#DC2626",
      inverse: "#ffffff", // text on dark/tint backgrounds
    },

    border: {
      default: "#e5e7eb",
      subtle: "#f3f4f6",
    },

    tint: tintColorLight,

    icon: {
      default: "#687076",
      active: tintColorLight,
    },

    tab: {
      iconDefault: "#687076",
      iconSelected: tintColorLight,
    },
  },

  dark: {
    background: {
      primary: "#111827",   // main app background
      secondary: "#1f2937", // cards, sections, panels
    },

    text: {
      primary: "#ECEDEE",
      secondary: "#d1d5db",
      muted: "#9ca3af",
      inverse: "#111827", 
      error: "#F87171"
    },

    border: {
      default: "#374151",
      subtle: "#1f2937",
    },

    tint: tintColorDark,

    icon: {
      default: "#9BA1A6",
      active: tintColorDark,
    },

    tab: {
      iconDefault: "#9BA1A6",
      iconSelected: tintColorDark,
    },
  },
} as const;
