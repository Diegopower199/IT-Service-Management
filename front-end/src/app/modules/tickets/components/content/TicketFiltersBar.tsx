"use client";

import { useState } from "react";

import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import type { TicketFilters } from "@/types/ticketTypes";

interface TicketFiltersBarProps {
  filters: TicketFilters;
  statusOptions: string[];
  priorityOptions: string[];
  categoryOptions: string[];
  onApply: (filters: TicketFilters) => void;
  onClear: () => void;
}

/**
 * Provides the controls used to filter the ticket list.
 *
 * Filter values are edited locally and are only applied when the user
 * explicitly submits them. This avoids sending a new API request for every
 * change made while configuring the filters.
 */
export default function TicketFiltersBar({
  filters,
  statusOptions,
  priorityOptions,
  categoryOptions,
  onApply,
  onClear,
}: TicketFiltersBarProps) {
  const [draftFilters, setDraftFilters] = useState<TicketFilters>(filters);

  /**
   * Updates one filter value locally without immediately applying it.
   */
  const handleFilterChange = (field: keyof TicketFilters, value: string) => {
    setDraftFilters((previous) => ({
      ...previous,
      [field]: value || null,
    }));
  };

  /**
   * Clears both the local filter controls and the applied filters.
   */
  const handleClear = () => {
    setDraftFilters({});
    onClear();
  };

  /**
   * Indicates whether at least one filter currently contains a value.
   */
  const hasFilters = Object.values(draftFilters).some(
    (value) => value !== null && value !== undefined && value !== "",
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        my: 3,
        borderRadius: 2,
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <FilterAltOutlinedIcon color="primary" />

          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={2}
          sx={{
            alignItems: {
              xs: "stretch",
              lg: "center",
            },
          }}
        >
          <TextField
            label="Search by title"
            value={draftFilters.title ?? ""}
            onChange={(event) =>
              handleFilterChange("title", event.target.value)
            }
            size="small"
            sx={{
              flex: 1.5,
              minWidth: 220,
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              flex: 1,
              minWidth: 150,
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              label="Status"
              value={
                statusOptions.includes(draftFilters.status ?? "")
                  ? draftFilters.status
                  : ""
              }
              onChange={(event) =>
                handleFilterChange("status", event.target.value ?? "")
              }
            >
              <MenuItem value="">All statuses</MenuItem>

              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              flex: 1,
              minWidth: 150,
            }}
          >
            <InputLabel>Priority</InputLabel>

            <Select
              label="Priority"
              value={
                priorityOptions.includes(draftFilters.priority ?? "")
                  ? draftFilters.priority
                  : ""
              }
              onChange={(event) =>
                handleFilterChange("priority", event.target.value ?? "")
              }
            >
              <MenuItem value="">All priorities</MenuItem>

              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              flex: 1,
              minWidth: 150,
            }}
          >
            <InputLabel>Category</InputLabel>

            <Select
              label="Category"
              value={
                categoryOptions.includes(draftFilters.category ?? "")
                  ? draftFilters.category
                  : ""
              }
              onChange={(event) =>
                handleFilterChange("category", event.target.value ?? "")
              }
            >
              <MenuItem value="">All categories</MenuItem>

              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="text"
            startIcon={<RestartAltIcon />}
            onClick={handleClear}
            disabled={!hasFilters}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={() => onApply(draftFilters)}
          >
            Apply filters
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
