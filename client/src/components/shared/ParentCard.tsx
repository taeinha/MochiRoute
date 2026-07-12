import {
  useTheme,
  Card,
  CardHeader,
  Divider,
  CardContent,
  Box,
} from "@mui/material";

interface CardProps {
  title?: string;
  footer?: string | React.ReactNode;
  children: React.ReactNode;
  width?: string | number;
  sx?: React.CSSProperties;
}

const ParentCard = ({ title, footer, children, width, sx }: CardProps) => {
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={{
        padding: 0,
        border: `1px solid ${borderColor}`,
        width: width || "100%",
        ...sx,
      }}
      variant="outlined"
    >
      {title && (
        <CardHeader
          title={title}
          sx={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
            padding: 0,
          }}
          slotProps={{
            title: {
              sx: {
                fontSize: "18px",
                padding: "10px",
                fontWeight: 500,
              },
            },
          }}
        />
      )}
      <Divider />

      <CardContent sx={{ width: "100%" }}>{children}</CardContent>

      {footer && (
        <>
          <Divider />
          <Box sx={{ padding: 3, width: "100%" }}>{footer}</Box>
        </>
      )}
    </Card>
  );
};

export default ParentCard;
