import {
  Button,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "@/store/store";

const LoginButtons = () => {
  const theme = useTheme();
  const authState = useSelector((state: RootState) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  let content: React.ReactNode;
  if (authState.isAuthenticated) {
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
        <Button variant="contained" color="primary">
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
      {content}
    </Stack>
  );
};

export default LoginButtons;
