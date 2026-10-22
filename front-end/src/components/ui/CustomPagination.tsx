"use client";

import { Pagination, Stack, Typography } from "@mui/material";

interface CustomPaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

/**
 * Reusable pagination component for paginated backend responses.
 *
 * This component adapts MUI pagination to Spring Pageable pagination:
 * - MUI pages start at 1.
 * - Spring Pageable pages start at 0.
 *
 * Example:
 * MUI page 1 -> Spring page 0
 * MUI page 2 -> Spring page 1
 *
 * @param page Current page using Spring Pageable indexing (starts at 0).
 * @param pageSize Number of elements displayed per page.
 * @param totalElements Total number of elements available.
 * @param onPageChange Callback executed when the user changes the page.
 */
export default function CustomPagination({
  page,
  pageSize,
  totalElements,
  onPageChange,
}: CustomPaginationProps) {
  const totalPages = Math.ceil(totalElements / pageSize);

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    onPageChange(newPage - 1);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mt: 3,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {totalElements} results
      </Typography>

      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={handlePaginationChange}
      />
    </Stack>
  );
}
