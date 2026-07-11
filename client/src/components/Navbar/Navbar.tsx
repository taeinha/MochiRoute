import { styled, AppBar, Box, Stack, IconButton, Toolbar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "@/store/store";
import Logo from "@/components/shared/Logo";
import { setActiveMode } from "@/store/slices/customSlice";
import { IconMoon, IconSun, IconX } from "@tabler/icons-react";
import LoginButtons from "@/components/navbar/LoginButtons";

const NavbarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "topbarHeight",
})<{ topbarHeight: number }>(({ theme, topbarHeight }) => ({
  boxShadow: "none",
  background: theme.palette.background.default,
  justifyContent: "center",
  backdropFilter: "blur(4px)",
  [theme.breakpoints.up("lg")]: {
    minHeight: topbarHeight,
  },
}));

const Navbar = () => {
  const customState = useSelector((state: RootState) => state.custom);
  const dispatch = useDispatch();

  return (
    <NavbarStyled
      position="sticky"
      color="default"
      topbarHeight={customState.TopbarHeight}
    >
      <Toolbar>
        <Logo notLink={false} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
          <IconButton
            color="inherit"
            size="large"
            onClick={() => {
              dispatch(setActiveMode(!customState.isDarkMode));
            }}
          >
            {customState.isDarkMode ? (
              <IconMoon size="21" stroke="1.5" />
            ) : (
              <IconSun size="21" stroke="1.5" />
            )}
          </IconButton>
          <LoginButtons />
        </Stack>
      </Toolbar>
    </NavbarStyled>
  );
};

export default Navbar;
