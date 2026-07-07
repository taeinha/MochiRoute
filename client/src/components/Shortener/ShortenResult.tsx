import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type { CreateUrlResponse } from "@mochiroute/shared";

interface ShortenResultProps {
  result: CreateUrlResponse | null;
  open: boolean;
}

const ShortenResult = ({ result, open }: ShortenResultProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.shortUrl) return;

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Collapse in={open && !!result} unmountOnExit>
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="success.main">
            Your short link is ready
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TextField
              value={result?.shortUrl ?? ""}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
            <IconButton
              color={copied ? "success" : "default"}
              onClick={handleCopy}
              aria-label="Copy short URL"
            >
              {copied ? (
                <IconCheck size={20} stroke={1.5} />
              ) : (
                <IconCopy size={20} stroke={1.5} />
              )}
            </IconButton>
          </Stack>

          {result?.originalUrl && (
            <Typography variant="caption" color="text.secondary" noWrap>
              Original: {result.originalUrl}
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              href={result?.shortUrl ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ width: "165px" }}
            >
              Open in new tab
            </Button>
          </Box>
        </Stack>
      </Box>
    </Collapse>
  );
};

export default ShortenResult;
