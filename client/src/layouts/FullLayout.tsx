import Navbar from "@/components/navbar/Navbar";
import { Container, Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Layout from "./Layout";

const FullLayout = () => {
  return (
    <Layout>
      <Navbar />
      <Container sx={{ pt: "30px" }}>
        <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
          <Outlet />
        </Box>
      </Container>
    </Layout>
  );
};

export default FullLayout;
