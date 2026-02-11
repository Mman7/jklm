import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NameDialog from "../components/dialogs/nameDialog";

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
          <div className="drawer-content h-[calc(100vh-4rem)] bg-emerald-100">
            {children}
          </div>
          <Sidebar />
        </div>
        <NameDialog />
      </body>
    </html>
  );
}
