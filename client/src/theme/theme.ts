import { createTheme } from "@mui/material/styles";
import { DarkThemeColor, LightThemeColor } from "./themeColors";

export const buildTheme = (isDarkMode: boolean = false) => {
  const themeConfig = isDarkMode ? DarkThemeColor : LightThemeColor;

  return createTheme({
    ...themeConfig,
    palette: {
      ...themeConfig.palette,
      mode: isDarkMode ? "dark" : "light",
    },
  });
};
