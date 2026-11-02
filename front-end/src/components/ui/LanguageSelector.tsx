"use client";

import { Box, MenuItem, Select, type SelectChangeEvent } from "@mui/material";

import { GB, ES } from "country-flag-icons/react/3x2";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value;

    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    router.refresh();
  };

  const renderLanguage = (language: string) => {
    const isEnglish = language === "en";

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          fontWeight: 600,
          fontSize: "0.875rem",
        }}
      >
        {isEnglish ? (
          <GB
            title="English"
            style={{
              width: 24,
              height: 16,
              borderRadius: 2,
            }}
          />
        ) : (
          <ES
            title="Español"
            style={{
              width: 24,
              height: 16,
              borderRadius: 2,
            }}
          />
        )}

        {language.toUpperCase()}
      </Box>
    );
  };

  return (
    <Select
      value={locale}
      onChange={handleLanguageChange}
      size="small"
      renderValue={(value) => renderLanguage(value)}
      sx={{
        minWidth: 90,
        height: 40,
        borderRadius: 3,

        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingY: 0,
        },

        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "divider",
        },

        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "primary.main",
        },

        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderWidth: 1,
        },
      }}
      MenuProps={{
        slotProps: {
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 110,
              boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
            },
          },
        },
      }}
    >
      <MenuItem
        value="en"
        sx={{
          justifyContent: "center",
          borderRadius: 1,
          mx: 0.5,
          my: 0.5,
        }}
      >
        {renderLanguage("en")}
      </MenuItem>

      <MenuItem
        value="es"
        sx={{
          justifyContent: "center",
          borderRadius: 1,
          mx: 0.5,
          my: 0.5,
        }}
      >
        {renderLanguage("es")}
      </MenuItem>
    </Select>
  );
}
