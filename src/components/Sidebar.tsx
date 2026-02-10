"use client";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();

  return (
    <div
      className={`${path === "/" && "hidden"} drawer-side w-64 lg:h-[calc(100vh-4rem)]`}
    >
      <label
        htmlFor="my-drawer-3"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul className="menu bg-base-200 min-h-full w-80 p-0">
        {/* Sidebar content here */}
        <li>
          <a>Sidebar Item 1</a>
        </li>
        <li>
          <a>Sidebar Item 2</a>
        </li>
      </ul>
    </div>
  );
}
