import { useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useRoutes } from "react-router-dom";
import { buildTheme } from "./theme/theme";
import Router from "@/routes/router";
import ScrollToTop from "./components/shared/ScrollToTop";
import { type RootState, useSelector } from "@/store/store";
import { myUser } from "@/api/auth";
import {
  setEmail,
  setIsAuthenticated,
  logout,
  setAuthChecked,
} from "@/store/slices";

function App() {
  const isDarkMode = useSelector((state: RootState) => state.custom.isDarkMode);
  const theme = useMemo(() => buildTheme(isDarkMode), [isDarkMode]);
  const routes = useRoutes(Router);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    const getUserAuth = async () => {
      try {
        const response = await myUser();

        if (cancelled) return;
        if (response.success && response.data) {
          dispatch(setEmail(response.data.email));
          dispatch(setIsAuthenticated(true));
        } else {
          dispatch(logout());
        }
      } catch {
        if (!cancelled) dispatch(logout());
      } finally {
        if (!cancelled) dispatch(setAuthChecked(true));
      }
    };
    getUserAuth();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScrollToTop>{routes}</ScrollToTop>
    </ThemeProvider>
  );
}

export default App;
