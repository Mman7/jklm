import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "JKLM",
  description: "Custom JKLM project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="pastel">
      <body>
        <Navbar />
        <div className="drawer lg:drawer-open h-[calc(100vh-4rem)]">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-emerald-100">
            {children}
          </div>
          <div className="drawer-side h-[calc(100vh-4rem)]">
            <Sidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
