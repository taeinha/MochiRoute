import { styled } from "@mui/material";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainWrapper>
      <PageWrapper>{children}</PageWrapper>
    </MainWrapper>
  );
};

export default Layout;
