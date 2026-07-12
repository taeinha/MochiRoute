import { Box, Typography } from "@mui/material";
import PageContainer from "@/components/page-container/PageContainer";
import ShortenForm from "@/components/shortener/ShortenForm";

const Home = () => {
  return (
    <PageContainer
      title="Home"
      description="Home page"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          pt: 8,
          px: { xs: 2, md: 0 },
          width: { xs: "100%", md: "60%" },
          maxWidth: 720,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Short links, fast
          </Typography>
          <Typography variant="h6">
            No account required. Sign up to manage your links.
          </Typography>
        </Box>

        <ShortenForm />
      </Box>
    </PageContainer>
  );
};

export default Home;
