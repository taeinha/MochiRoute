import {
  Button,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "@/store/store";
import { logout } from "@/api/auth";
import { logout as logoutAction } from "@/store/slices";
import { useNavigate } from "react-router-dom";

const LoginButtons = () => {
  const theme = useTheme();
  const authState = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const response = await logout();
      if (!response.success) {
        throw new Error(response.message ?? "Failed to logout");
      }
      dispatch(logoutAction());
      navigate("/");
    } catch {
      setError("Failed to logout");
    }
  };

  let content: React.ReactNode;
  if (!authState.authChecked) {
    content = null;
  } else if (authState.isAuthenticated) {
    content = (
      <>
        {authState.email && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {authState.email}
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Log Out
        </Button>
      </>
    );
  } else {
    content = (
      <>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="primary"
          size={isMobile ? "small" : "medium"}
          sx={{
            whiteSpace: "nowrap",
            minWidth: "auto",
            px: { xs: 1.5, sm: 2 },
          }}
        >
          Log In
        </Button>
        {!isMobile && (
          <Button
            component={Link}
            to="/signup"
            variant="outlined"
            color="primary"
          >
            Sign Up
          </Button>
        )}
      </>
    );
  }
  return (
    <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => setError(null)}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {content}
    </Stack>
  );
};

export default LoginButtons;
