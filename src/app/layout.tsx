import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NameDialog from "../components/dialogs/nameDialog";
import Loading from "../components/Loading";

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
      <body className="bg-base-200 relative min-h-screen overflow-x-hidden ">
        <Navbar />
        <div className="drawer lg:drawer-open h-[calc(100dvh-4rem)]">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center">
            {children}
          </div>
          <Sidebar />
        </div>
        <NameDialog />
        <Loading />
      </body>
    </html>
  );
}
