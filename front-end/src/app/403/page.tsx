"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
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
        403
      </Typography>

      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Access Denied
      </Typography>

      <Typography color="text.secondary">
        You do not have permission to access this page.
      </Typography>

      <Button variant="contained" onClick={() => router.push("/dashboard")}>
        Back to Dashboard
      </Button>
    </Stack>
  );
}
