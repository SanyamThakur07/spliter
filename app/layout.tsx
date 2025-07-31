import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spliter",
  description: "A smart way to split expenses with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/logo-s.png" sizes="any" />
      </head>
      <body className={`${inter.className}`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <Header />
            <main className="pt-20">
              <Toaster richColors />
              {children}
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
