import { useState } from "react";
import { Alert, Box, Button, Stack, Snackbar } from "@mui/material";
import CustomFormLabel from "../shared/Form/CustomFormLabel";
import CustomTextField from "../shared/Form/CustomTextField";
import {
  type LoginRequest,
  type RegisterRequest,
  loginSchema,
  registerSchema,
} from "@mochiroute/shared";
import { parseFormFieldErrors } from "@/util";
import { login, register } from "@/api/auth";

type AuthFormData = LoginRequest | RegisterRequest;
interface AuthFormProps {
  formType: "login" | "signup";
}

const AuthForm = ({ formType }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFormData & {}>({
    email: "",
    password: "",
  });
  const [formSuccess, setFormSuccess] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validatedData =
      formType === "login"
        ? loginSchema.safeParse(formData)
        : registerSchema.safeParse(formData);
    if (!validatedData.success) {
      setFieldErrors({
        email: parseFormFieldErrors(validatedData.error, "email").join(". "),
        password: parseFormFieldErrors(validatedData.error, "password").join(
          ". ",
        ),
      });
      return;
    }

    const { email, password } = validatedData.data;
    setIsLoading(true);
    setFieldErrors({ email: "", password: "" });
    try {
      const response =
        formType === "login"
          ? await login(email, password)
          : await register(email, password);
      if (!response.success || !response.data) {
        console.log(response);
        setFormError(
          response.message ??
            "Failed to " + (formType === "login" ? "log in" : "sign up"),
        );
        return;
      }
      setFormSuccess(
        formType === "login" ? "Login successful" : "Sign up successful",
      );
    } catch {
      setFieldErrors({
        email: "Network error. Please try again.",
        password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box>
          {formError && <Alert severity="error">{formError}</Alert>}
          {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
          <CustomFormLabel htmlFor="email-input">Email</CustomFormLabel>
          <CustomTextField
            id="email-input"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            slotProps={{
              htmlInput: {
                maxLength: 2048,
                "data-cy": "email-input",
              },
            }}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            disabled={isLoading}
          />
        </Box>
        <Box>
          <CustomFormLabel htmlFor="password-input">Password</CustomFormLabel>
          <CustomTextField
            id="password-input"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            slotProps={{
              htmlInput: {
                maxLength: 2048,
                "data-cy": "password-input",
              },
            }}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            disabled={isLoading}
            type="password"
          />
        </Box>
        <Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: "15px" }}
            fullWidth
            disabled={isLoading}
            loading={isLoading}
            data-cy={`auth-${formType}-submit`}
          >
            {isLoading
              ? "Loading..."
              : formType === "login"
                ? "Log In"
                : "Sign Up"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

export default AuthForm;
