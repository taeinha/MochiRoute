import { useMemo } from "react";
import type { Order } from "@/types";
import {
  Box,
  Paper,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import CustomTableHeader from "./CustomTableHeader";
import { getComparator } from "@/util";
import type { HeadCell } from "@/types";
import DeleteIcon from "@mui/icons-material/Delete";

interface CustomTableProps<T> {
  rows: T[];
  headCells: readonly HeadCell<T>[];
  getRowId: (row: T) => string | number;
  onDelete?: (row: T) => void;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

const CustomTable = <T,>({
  rows,
  headCells,
  getRowId,
  onDelete,
  totalCount,
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: CustomTableProps<T>) => {
  const serverPaged = totalCount !== undefined;
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof T>(headCells[0].id);
  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(5);

  const page = serverPaged ? (controlledPage ?? 0) : localPage;
  const rowsPerPage = serverPaged
    ? (controlledRowsPerPage ?? 5)
    : localRowsPerPage;

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof T,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (serverPaged) {
      onPageChange?.(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const next = parseInt(event.target.value, 10);
    if (serverPaged) {
      onRowsPerPageChange?.(next);
    } else {
      setLocalRowsPerPage(next);
      setLocalPage(0);
    }
  };

  const visibleRows = useMemo(() => {
    const sorted = [...rows].sort(getComparator(order, orderBy));
    if (serverPaged) return sorted;
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, order, orderBy, page, rowsPerPage, serverPaged]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="Data Table"
            size="medium"
          >
            <CustomTableHeader
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={headCells}
              showActions={Boolean(onDelete)}
            />
            <TableBody>
              {visibleRows.map((row) => {
                return (
                  <TableRow hover tabIndex={-1} key={getRowId(row)}>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={String(headCell.id)}
                        align={headCell.numeric ? "right" : "left"}
                        padding={headCell.disablePadding ? "none" : "normal"}
                      >
                        {String(row[headCell.id] ?? "")}
                      </TableCell>
                    ))}
                    {onDelete && (
                      <TableCell align="right" padding="normal">
                        <IconButton
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(row);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={serverPaged ? totalCount : rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default CustomTable;
