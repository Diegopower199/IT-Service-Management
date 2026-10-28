"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const router = useRouter();

  return (
    <Stack
      spacing={2}
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography component="h1" variant="h1" sx={{ fontWeight: 700 }}>
        500
      </Typography>

      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Something Went Wrong
      </Typography>

      <Typography color="text.secondary">
        An unexpected error occurred while loading this page.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={reset}>
          Try Again
        </Button>

        <Button variant="outlined" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </Stack>
    </Stack>
  );
}
