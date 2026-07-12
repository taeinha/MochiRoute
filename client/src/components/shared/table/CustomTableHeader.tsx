import type { HeadCell, Order } from "@/types";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Box,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { useTheme } from "@mui/material/styles";

interface CustomTableHeaderProps<T> {
  headCells: readonly HeadCell<T>[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: keyof T;
  showActions?: boolean;
}

const CustomTableHeader = <T,>({
  headCells,
  onRequestSort,
  order,
  orderBy,
  showActions = false,
}: CustomTableHeaderProps<T>) => {
  const theme = useTheme();
  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead
      sx={{
        "& .MuiTableCell-head": {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
          fontWeight: 600,
        },
        "& .MuiTableSortLabel-root": {
          color: "inherit",
          "&:hover": {
            color: "inherit",
          },
          "&.Mui-active": {
            color: "inherit",
            "& .MuiTableSortLabel-icon": {
              color: "inherit",
            },
          },
        },
        "& .MuiTableSortLabel-icon": {
          color: "inherit",
        },
      }}
    >
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={`${String(headCell.id)}`}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={
              headCell.truncate || headCell.width !== undefined
                ? {
                    ...(headCell.width !== undefined
                      ? { width: headCell.width }
                      : {}),
                    ...(headCell.truncate
                      ? {
                          maxWidth: headCell.maxWidth ?? 280,
                          overflow: "hidden",
                        }
                      : {}),
                  }
                : undefined
            }
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {showActions && (
          <TableCell align="right" padding="normal">
            Actions
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};

export default CustomTableHeader;
