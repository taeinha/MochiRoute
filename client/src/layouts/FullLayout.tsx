import { styled } from "@mui/material";
import Navbar from "@/components/Navbar/Navbar";
import { Container, Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

const FullLayout = () => {
  return (
    <MainWrapper>
      <PageWrapper>
        <Navbar />
        <Container sx={{ pt: "30px" }}>
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
            <Outlet />
          </Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
