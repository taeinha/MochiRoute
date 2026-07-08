import { TextField, Typography, Button, Stack, Box } from "@mui/material";
import ParentCard from "../ParentCard";
import {
  type CreateUrlRequest,
  createUrlSchema,
  type CreateUrlResponse,
} from "@mochiroute/shared";
import { useState } from "react";
import ShortenResult from "./ShortenResult";
import { createShortUrl } from "@/api";

const ShortenForm = () => {
  // const authState = useSelector((state: RootState) => state.auth);
  // const isAuthenticated = authState.isAuthenticated;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CreateUrlRequest>({
    originalUrl: "",
  });
  const [formData, setFormData] = useState({
    originalUrl: "",
  });
  const [result, setResult] = useState<CreateUrlResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async () => {
    const validatedData = createUrlSchema.safeParse(formData);
    if (!validatedData.success) {
      const messages = validatedData.error.issues
        .filter((i) => i.path[0] === "originalUrl")
        .map((i) => i.message);

      setError({
        originalUrl: messages.length > 0 ? messages.join(". ") : "Invalid URL",
      });
      return;
    }

    const { originalUrl } = validatedData.data;
    setIsLoading(true);
    setResult(null);
    setError({ originalUrl: "" });
    try {
      const response = await createShortUrl(originalUrl);
      if (!response.success || !response.data) {
        setError({ originalUrl: response.message ?? "Failed to shorten URL" });
        return;
      }
      setResult(response.data);
      setError({ originalUrl: "" });
    } catch {
      setError({ originalUrl: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <ParentCard title="Shorten URL">
        <Stack spacing={1}>
          <Typography variant="subtitle2">
            Paste a link and get a shortened URL
          </Typography>
          <TextField
            id="shorten-url-input"
            name="originalUrl"
            value={formData.originalUrl}
            onChange={handleChange}
            fullWidth
            error={!!error.originalUrl}
            helperText={error.originalUrl ?? ""}
            size="small"
            disabled={isLoading}
            slotProps={{
              htmlInput: {
                maxLength: 2048,
                "data-cy": "shorten-url-input",
              },
            }}
          />
          <Box sx={{ display: "flex" }}>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ width: "165px", mt: 1 }}
              disabled={isLoading}
              loading={isLoading}
              data-cy="shorten-url-submit"
            >
              Shorten
            </Button>
          </Box>
        </Stack>
      </ParentCard>
      <ShortenResult result={result} open={Boolean(result)} />
    </>
  );
};

export default ShortenForm;
