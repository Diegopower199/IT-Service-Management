"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
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
      <Typography variant="h1" sx={{ fontWeight: 700 }}>
        404
      </Typography>

      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Page Not Found
      </Typography>

      <Typography color="text.secondary">
        The page you are looking for does not exist.
      </Typography>

      <Button variant="contained" onClick={() => router.push("/dashboard")}>
        Go to Dashboard
      </Button>
    </Stack>
  );
}
