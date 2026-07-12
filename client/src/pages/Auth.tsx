import { Link } from "react-router-dom";
import { Box, Divider, Typography, IconButton } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import PageContainer from "@/components/page-container/PageContainer";
import AuthForm from "@/components/auth/AuthForm";
import Logo from "@/components/shared/Logo";
import catWalkingImg from "@/assets/cat-walking.png";
import catSleepingImg from "@/assets/cat-sleeping.png";

interface AuthProps {
  type: "login" | "signup";
}

const Auth = ({ type }: AuthProps) => {
  const title = type === "login" ? "Log In" : "Sign Up";
  const description =
    type === "login" ? (
      <>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </>
    ) : (
      <>
        Already have an account? <Link to="/login">Log in</Link>
      </>
    );

  return (
    <PageContainer
      title={title}
      description={
        type === "login" ? "Log in to your account" : "Sign up for an account"
      }
      sx={{
        display: "flex",
        minHeight: "100%",
        width: "100%",
        flex: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flex: 1,
          alignItems: "stretch",
        }}
      >
        {/* Left side */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 3, md: 8 },
            py: 4,
            width: { xs: "100%", md: "50%" },
            minHeight: "100vh",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Logo notLink={false} />
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {title}
            </Typography>
            <Typography variant="subtitle1">{description}</Typography>
            <Divider>
              <p style={{ marginLeft: "10px", marginRight: "10px" }}>
                continue with
              </p>
            </Divider>
            <AuthForm formType={type} />
          </Box>
        </Box>
        {/* Right side */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            width: "50%",
            flexDirection: "column",
            background: "linear-gradient(90deg, #0d7693, #002342)",
            p: 2,
            minHeight: "100vh",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton component={Link} to="/" sx={{ color: "common.white" }}>
              <IconX size={21} stroke="1.5" />
            </IconButton>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={type === "login" ? catWalkingImg : catSleepingImg}
              alt="Auth Background"
              style={{ width: "80%", height: "80%", objectFit: "contain" }}
            />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Auth;
