import { useTheme as useThemeContext } from "@/components/providers/ThemeProvider";

export const useTheme = () => {
  const { theme, setTheme } = useThemeContext();

  const isDark = theme === "dark";
  const isLight = theme === "light";
  const isSystem = theme === "system";

  return {
    theme,
    setTheme,
    isDark,
    isLight,
    isSystem,
  };
}; 