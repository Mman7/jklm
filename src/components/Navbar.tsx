"use client";

import { Menu } from "lucide-react";
import useAuth from "../zustands/useAuthStore";

export default function Navbar() {
  const { name } = useAuth();
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div className="btn btn-ghost btn-circle mx-4 lg:hidden">
            <label htmlFor="my-drawer-3" className="btn drawer-button">
              <Menu />
            </label>
          </div>
        </div>
      </div>
      <div className="navbar-center">{/* content center */}</div>
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <h1>{name}</h1>
        </button>
      </div>
    </div>
  );
}
