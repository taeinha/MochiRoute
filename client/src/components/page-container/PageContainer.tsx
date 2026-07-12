import { Box, type SxProps } from "@mui/material";
import { Helmet } from "react-helmet-async";

interface PageContainerProps {
  title?: string;
  description?: string;
  children: React.ReactElement | React.ReactElement[];
  sx?: SxProps;
}

const PageContainer = ({
  title,
  description,
  children,
  sx,
}: PageContainerProps) => {
  return (
    <Box sx={sx}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      {children}
    </Box>
  );
};

export default PageContainer;
