import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function PageLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
