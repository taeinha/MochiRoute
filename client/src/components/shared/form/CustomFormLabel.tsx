import { styled } from "@mui/material";
import { Typography, type TypographyProps } from "@mui/material";

type CustomFormLabelProps = TypographyProps<"label">;

const CustomFormLabel = styled((props: CustomFormLabelProps) => (
  <Typography
    variant="subtitle1"
    {...props}
    component="label"
    htmlFor={props.htmlFor}
  />
))(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: "5px",
  marginTop: "18px",
  display: "block",
}));

export default CustomFormLabel;
