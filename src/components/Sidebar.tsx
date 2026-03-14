"use client";

import { usePathname } from "next/navigation";
import SidebarContent from "./SidebarContent";

export default function Sidebar() {
  const path = usePathname();
  const shouldHideSidebar = path === "/";

  return (
    <div
      className={`drawer-side lg:h-[calc(100vh-4rem)] ${shouldHideSidebar ? "hidden" : ""}`}
    >
      <SidebarContent />
    </div>
  );
}
