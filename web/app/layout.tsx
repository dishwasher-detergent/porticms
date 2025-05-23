import type { Metadata } from "next";
import { IBM_Plex_Mono, Rubik } from "next/font/google";
import { Toaster } from "sonner";

import { SessionProvider } from "@/providers/session-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "200", "500", "600"],
});

export const metadata: Metadata = {
  title: "KURIOH.",
  description:
    "Curate your portfolio without the hassle. A headless CMS designed specifically for portfolio websites.",
  metadataBase: new URL("https://kurioh.com"),
  openGraph: {
    title: "KURIOH.",
    description:
      "Curate your portfolio without the hassle. A headless CMS designed specifically for portfolio websites.",
    url: "https://kurioh.com",
    siteName: "kurioh.com",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "KURIOH.",
    description:
      "Curate your portfolio without the hassle. A headless CMS designed specifically for portfolio websites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${rubik.variable} ${ibmPlexMono.variable} font-rubik flex min-h-dvh flex-col overflow-x-hidden antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
            <div id="modal-root" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
