import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { FaRegUser, FaRegHeart, FaCartShopping } from "react-icons/fa6";
import avatarImg from "../assets/avatar.png";
import logo from "../assets/books/logo.png";
import { useSelector } from "react-redux";
import { useAuth } from "./../context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Cart Page", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
];

const Navbar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const dropdownRef = useRef(null);
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${query}`);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) =>
    location.pathname === path ? "text-primary font-semibold" : "";

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center md:gap-10">
          <Link to="/">
            <img className="w-16 object-cover ml-8" src={logo} alt="Logo" />
          </Link>

          {/* Search input */}
          <div className="relative sm:w-72 w-40">
          <button onClick={handleSearch}><IoSearchOutline className="absolute inline-block left-3 inset-y-2" /></button>
            <input
              type="text"
              placeholder="Nhập tên sách..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline"
            />
          </div>

          {/* Navigation Links */}
          <Link to="/" className={`hover:text-primary ${isActive("/")}`}>
            Home
          </Link>
          <Link
            to="/product"
            className={`hover:text-primary ${isActive("/product")}`}
          >
            Product
          </Link>
          <Link
            to="/product/business"
            className={`hover:text-primary ${isActive("/product/business")}`}
          >
            Business
          </Link>
          <Link
            to="/product/fiction"
            className={`hover:text-primary ${isActive("/product/fiction")}`}
          >
            Fiction
          </Link>
          <Link
            to="/product/adventure"
            className={`hover:text-primary ${isActive("/product/adventure")}`}
          >
            Adventure
          </Link>
          <Link
            to="/product/manga"
            className={`hover:text-primary ${isActive("/product/manga")}`}
          >
            Manga
          </Link>
        </div>

        {/* Right side */}
        <div className="relative flex items-center md:space-x-2">
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={avatarImg}
                    alt=""
                    className={`size-7 rounded-full ${
                      currentUser ? "ring-2 ring-blue-500" : ""
                    }`}
                  />
                </button>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                    <ul className="py-2">
                      {navigation.map((item) => (
                        <li
                          key={item.name}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : token ? (
              <Link to="/dashboard" className="border-b-2 border-primary">
                Dashboard
              </Link>
            ) : (
              <Link to="/login">
                <FaRegUser className="size-6" />
              </Link>
            )}
          </div>

          <button className="hidden sm:block">
            <FaRegHeart className="size-6" />
          </button>

          <Link
            to="/cart"
            className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm"
          >
            <FaCartShopping />
            {cartItems.length > 0 ? (
              <span className="text-sm font-semibold sm:ml-1">
                {cartItems.length}
              </span>
            ) : (
              <span className="text-sm font-semibold sm:ml-1">0</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
