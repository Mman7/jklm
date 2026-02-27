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
      <body className="relative min-h-screen overflow-x-hidden">
        {/* Animated background */}
        <div className="animate-gradient from-primary/10 via-secondary/10 to-accent/10 fixed inset-0 -z-10 bg-linear-to-br"></div>

        {/* Floating decorative elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="animate-float-slow bg-primary/20 absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"></div>
          <div className="animate-float bg-secondary/20 absolute top-1/3 -right-32 h-80 w-80 rounded-full blur-3xl"></div>
          <div className="animate-pulse-glow bg-accent/20 absolute -bottom-32 left-1/4 h-96 w-96 rounded-full blur-3xl"></div>
        </div>

        <Navbar />
        <div className="drawer lg:drawer-open h-[calc(100dvh-4rem)]">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center overflow-hidden">
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
