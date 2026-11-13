import type { Metadata } from "next";
import { Inter, Poppins, Source_Serif_4 } from "next/font/google";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Sajam",
  description:
    "Kupuj i prodaj knjige, muziku, igre, mange, stripove i opremu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sr-Latn"
      className={`${inter.variable} ${poppins.variable} ${sourceSerif.variable}`}
    >
      <body className="antialiased">
        <NavBar />
        <main className="min-h-[50vh]">{children}</main>
        <Footer />
        <Suspense>
          <AuthModal />
        </Suspense>
      </body>
    </html>
  );
}
