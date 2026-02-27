"use client";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();
  return (
    <div
      className={`drawer-side lg:h-[calc(100vh-4rem)] ${path === "/" && "hidden"}`}
    >
      <label
        htmlFor="my-drawer-3"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul className="menu border-base-content/10 bg-base-100/90 min-h-full w-80 border-r p-4 backdrop-blur-xl">
        {/* Sidebar content here */}
        <li>
          <a className="hover:bg-base-content/5 rounded-lg">Sidebar Item 1</a>
        </li>
        <li>
          <a className="hover:bg-base-content/5 rounded-lg">Sidebar Item 2</a>
        </li>
      </ul>
    </div>
  );
}
