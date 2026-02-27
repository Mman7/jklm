"use client";

import { Menu } from "lucide-react";
import useAuth from "../zustands/useAuthStore";
import { usePathname } from "next/navigation";
import useNameDialog from "../zustands/useNameDialogStore";

export default function Navbar() {
  const { name } = useAuth();
  const { setShowNameDialog } = useNameDialog();

  const path = usePathname();

  const handleChangedName = () => {
    setShowNameDialog(true);
  };

  return (
    <div className="navbar border-base-content/10 bg-base-100/80 relative z-30 border-b shadow-lg backdrop-blur-xl">
      <div className="navbar-start">
        <div className="dropdown">
          <label
            htmlFor="my-drawer-3"
            className={`btn btn-ghost btn-circle drawer-button mx-4 lg:hidden ${path === "/" && "hidden"}`}
          >
            <Menu />
          </label>
        </div>
      </div>
      <div className="navbar-center">{/* content center */}</div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-ghost hover:bg-base-content/5 w-full justify-end"
          >
            <div className="ring-base-content/20 h-10 w-10 overflow-hidden rounded-full ring-2">
              <img
                src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mr-3">{name}</h1>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu border-base-content/20 bg-base-100/95 z-50 mt-2 w-52 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl"
          >
            <li>
              <button
                className="hover:bg-base-content/5 rounded-xl"
                onClick={handleChangedName}
              >
                Change Name
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
