import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import type { UrlRecord } from "@mochiroute/shared";
import { urlHeadCells } from "@/constants";
import ShortenForm from "@/components/shortener/ShortenForm";
import CustomTable from "@/components/shared/table/CustomTable";
import Spinner from "@/components/shared/spinner/Spinner";
import { deleteUrl, getUrls } from "@/api";

const AuthenticatedHome = () => {
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const requestIdRef = useRef(0);

  const loadUrls = useCallback((nextPage: number, nextRowsPerPage: number) => {
    const requestId = ++requestIdRef.current;

    getUrls({
      page: nextPage + 1,
      pageLength: nextRowsPerPage,
    })
      .then((response) => {
        if (requestId !== requestIdRef.current) return;

        if (response.success && response.data) {
          setError(null);
          setUrls(response.data);
          setTotalCount(response.count);
          return;
        }
        setError(response.message ?? "Failed to load URLs");
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setError("Network error. Please try again.");
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadUrls(page, rowsPerPage);
  }, [page, rowsPerPage, loadUrls]);

  const refreshUrls = (nextPage = page, nextRowsPerPage = rowsPerPage) => {
    setLoading(true);
    loadUrls(nextPage, nextRowsPerPage);
  };

  const handleDelete = (id: string) => {
    deleteUrl(id).then((response) => {
      if (!response.success) return;

      const remainingOnPage = urls.length - 1;
      if (remainingOnPage === 0 && page > 0) {
        setLoading(true);
        setPage((p) => p - 1);
        return;
      }
      refreshUrls(page, rowsPerPage);
    });
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setLoading(true);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        px: { xs: 2, md: 0 },
        width: { xs: "100%", md: "90%" },
        maxWidth: 960,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 720,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Dashboard
          </Typography>
        </Box>

        <ShortenForm
          onCreated={() => {
            if (page === 0) {
              refreshUrls(0, rowsPerPage);
            } else {
              setLoading(true);
              setPage(0);
            }
          }}
        />
      </Box>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4, width: "100%" }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ mt: 4, width: "100%" }}>
          <CustomTable
            rows={urls}
            headCells={urlHeadCells}
            getRowId={(row) => row.id}
            onDelete={(row) => handleDelete(String(row.id))}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default AuthenticatedHome;
