import type { MouseEvent } from "react";
import { styled } from "@mui/material";
import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logoUrl from "@/assets/mochiroute-logo.svg";

interface LinkStyledProps {
  topbarHeight?: number;
  notLink?: boolean;
}

const LinkStyled = styled(Link, {
  shouldForwardProp: (prop) => prop !== "topbarHeight" && prop !== "notLink",
})<LinkStyledProps>(({ topbarHeight, notLink }) => ({
  height: topbarHeight,
  width: "100%",
  maxWidth: "180px",
  overflow: "hidden",
  display: "block",
  pointerEvents: notLink ? "none" : "auto",
}));

const StyledLogo = styled("div")(() => ({
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "default",
  "& img": {
    maxWidth: "100%",
    maxHeight: "100%",
  },
}));

const Logo = ({ notLink }: LinkStyledProps) => {
  const customState = useSelector((state: RootState) => state.custom);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (notLink) {
      e.preventDefault();
    }
  };

  return (
    <LinkStyled
      to={isAuthenticated ? "/dashboard" : "/"}
      onClick={handleClick}
      topbarHeight={customState.TopbarHeight}
      notLink={notLink}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <StyledLogo>
        <img src={logoUrl} alt="MochiRoute" />
      </StyledLogo>
    </LinkStyled>
  );
};

export default Logo;
