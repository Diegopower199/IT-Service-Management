import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

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
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
