import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Keith Rumjahn - Personal Links",
  description: "Keith Rumjahn's personal links page - A.I. content creator, educator, and n8n expert",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${poppins.variable} antialiased min-h-screen bg-gray-50 font-sans`}
      >
        <div className="relative flex min-h-screen flex-col">
          {/* <MainNav /> */}
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
