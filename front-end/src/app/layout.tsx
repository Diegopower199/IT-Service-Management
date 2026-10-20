import type { Metadata } from "next";

import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Help Desk",
  description: "IT Service Management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
