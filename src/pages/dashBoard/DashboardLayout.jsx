import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { HiViewGridAdd } from "react-icons/hi";
import { MdOutlineManageHistory } from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { BsFileEarmarkPersonFill } from "react-icons/bs";
import { FaLuggageCart } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to get menu item classes
  const getMenuItemClasses = (path) => {
    const baseClasses =
      "inline-flex items-center justify-center py-3 rounded-lg";
    return isActive(path)
      ? `${baseClasses} text-purple-600 bg-white`
      : `${baseClasses} hover:text-gray-400 hover:bg-gray-700 focus:text-gray-400 focus:bg-gray-700`;
  };

  return (
    <section className="flex md:bg-gray-100 min-h-screen overflow-hidden">
      <aside className="hidden sm:flex sm:flex-col">
        <a
          href="/"
          className="inline-flex items-center justify-center h-20 w-20 bg-purple-600 hover:bg-purple-500 focus:bg-purple-500"
        >
          <img src="/fav-icon.png" alt="" />
        </a>
        <div className="flex-grow flex flex-col justify-between text-gray-500 bg-gray-800">
          <nav className="flex flex-col mx-4 my-6 space-y-4">
            <Link to="/dashboard" className={getMenuItemClasses("/dashboard")}>
              <span className="sr-only">Dashboard</span>
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </Link>
            <Link
              to="/dashboard/add-new-book"
              className={getMenuItemClasses("/dashboard/add-new-book")}
            >
              <span className="sr-only">Add Book</span>
              <FaBook className="h-6 w-6" />
            </Link>
            <Link
              to="/dashboard/manage-books"
              className={getMenuItemClasses("/dashboard/manage-books")}
            >
              <span className="sr-only">Manage Books</span>
              <MdOutlineManageHistory className="h-6 w-6" />
            </Link>
            <Link
              to="/dashboard/manage-categories"
              className={getMenuItemClasses("/dashboard/manage-categories")}
            >
              <span className="sr-only">Manage Categories</span>
              <HiViewGridAdd className="h-6 w-6" />
            </Link>
            <Link
              to="/dashboard/manage-authors"
              className={getMenuItemClasses("/dashboard/manage-authors")}
            >
              <span className="sr-only">Manage Authors</span>
              <BsFileEarmarkPersonFill className="h-6 w-6" />
            </Link>
            <Link
              to="/dashboard/manage-users"
              className={getMenuItemClasses("/dashboard/manage-users")}
            >
              <span className="sr-only">Manage Users</span>
              <FaUserTie className="h-6 w-6" />
            </Link>
            <Link
              to="/dashboard/manage-orders"
              className={getMenuItemClasses("/dashboard/manage-orders")}
            >
              <span className="sr-only">Manage Orders</span>
              <FaLuggageCart className="h-6 w-6" />
            </Link>
          </nav>
          <div className="inline-flex items-center justify-center h-20 w-20 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="p-3 hover:text-gray-400 hover:bg-gray-700 focus:text-gray-400 focus:bg-gray-700 rounded-lg"
            >
              <span className="sr-only">Logout</span>
              <svg
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-grow text-gray-800">
        <header className="flex items-center h-20 px-6 sm:px-10 bg-white">
          <button className="block sm:hidden relative flex-shrink-0 p-2 mr-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:bg-gray-100 focus:text-gray-800 rounded-full">
            <span className="sr-only">Menu</span>
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
          <div className="flex flex-shrink-0 items-center ml-auto">
            <button className="inline-flex items-center p-2 hover:bg-gray-100 focus:bg-gray-100 rounded-lg">
              <span className="sr-only">User Menu</span>
              <div className="hidden md:flex md:flex-col md:items-end md:leading-tight">
                <span className="font-semibold">Pham Quoc Vuong</span>
                <span className="text-sm text-gray-600">Admin</span>
              </div>
              <span className="h-12 w-12 ml-2 sm:ml-3 mr-2 bg-gray-100 rounded-full overflow-hidden">
                <img
                  src="https://hoathinh4k3.top/wp-content/uploads/2025/01/007xgN06gy1hxj7l2rmqwj31o12yo4qq-1.jpg"
                  alt="user profile photo"
                  className="h-full w-full object-cover"
                />
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="hidden sm:block h-6 w-6 text-gray-300"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="border-l pl-3 ml-3 space-x-1">
              <button className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-100 focus:text-gray-600 rounded-full">
                <span className="sr-only">Notifications</span>
                <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-2 bg-red-500 rounded-full"></span>
                <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-2 bg-red-500 rounded-full animate-ping"></span>
                <svg
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              <button
                onClick={handleLogout}
                className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-100 focus:text-gray-600 rounded-full"
              >
                <span className="sr-only">Log out</span>
                <svg
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-10 space-y-6">
          <Outlet />
        </main>
      </div>
    </section>
  );
};

export default DashboardLayout;
