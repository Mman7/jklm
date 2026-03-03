"use client";

import { Menu } from "lucide-react";
import useAuth from "../zustands/useAuthStore";
import { usePathname } from "next/navigation";
import useNameDialog from "../zustands/useNameDialogStore";
import useGame from "../zustands/useGameStore";

export default function Navbar() {
  const { name } = useAuth();
  const { setShowNameDialog } = useNameDialog();
  const { gameReady } = useGame();
  const initials = name.trim().slice(0, 2).toUpperCase();

  const path = usePathname();
  const shouldHideDrawerToggle = path === "/" || gameReady;

  const handleChangedName = () => {
    setShowNameDialog(true);
  };

  return (
    <div className="navbar border-base-content/10 bg-base-100/80 relative z-30 border-b">
      <div className="navbar-start">
        <div className="dropdown">
          <label
            htmlFor="my-drawer-3"
            className={`btn btn-ghost btn-circle drawer-button mx-4 lg:hidden ${shouldHideDrawerToggle ? "hidden" : ""}`}
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
            <div className="bg-primary/15 text-primary flex size-11 items-center justify-center rounded-full text-xs font-bold">
              <h1 className="text-md">{initials}</h1>
            </div>
            <h1 className="mr-3">{name}</h1>
          </button>
          {path === "/" && (
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
          )}
        </div>
      </div>
    </div>
  );
}
