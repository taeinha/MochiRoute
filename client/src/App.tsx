import { useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useRoutes } from "react-router-dom";
import { buildTheme } from "./theme/theme";
import Router from "@/routes/router";
import ScrollToTop from "./components/ScrollToTop";
import { type RootState, useSelector } from "@/store/store";

function App() {
  const isDarkMode = useSelector((state: RootState) => state.custom.isDarkMode);
  const theme = useMemo(() => buildTheme(isDarkMode), [isDarkMode]);
  const routes = useRoutes(Router);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScrollToTop>{routes}</ScrollToTop>
    </ThemeProvider>
  );
}

export default App;
