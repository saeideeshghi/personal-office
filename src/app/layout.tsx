import type { Metadata } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "./globals.css";
import { Providers } from "@/components/app-shell/providers";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = {
  title: {
    default: "دفتر شخصی | Personal Office",
    template: "%s | Personal Office",
  },
  description:
    "یک دفتر مجازی برای برنامه‌ریزی، تمرکز و ساختن؛ فضای شخصی کارهای مهم.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">
          رفتن به محتوای اصلی
        </a>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
