import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { FaRegUser, FaRegHeart, FaCartShopping } from "react-icons/fa6";
import avatarImg from "../assets/avatar.png";
import logo from "../assets/books/logo.png";
import { useSelector } from "react-redux";
import { useAuth } from "./../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchSuggestions from "./SearchSuggestions";
import { useGetSearchSuggestionsQuery } from "../redux/features/search/searchApi";
import { debounce } from "lodash";

const navigation = [
  { name: "Profile", href: "/profile" },
  { name: "Orders", href: "/orders" },
  { name: "Cart Page", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
];

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { t } = useTranslation();
  const searchRef = useRef(null);

  // Lấy suggestions từ API
  const { data: suggestions } = useGetSearchSuggestionsQuery(query, {
    skip: !query || query.length < 2,
  });

  // Debug currentUser
  useEffect(() => {
    console.log("Current User:", currentUser);
  }, [currentUser]);

  const dropdownRef = useRef(null);

  // Xử lý click outside để đóng suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search input
  const debouncedSearch = debounce((value) => {
    if (value.length >= 2) {
      setQuery(value);
      setShowSuggestions(true);
    } else {
      setQuery("");
      setShowSuggestions(false);
    }
  }, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (selectedQuery) => {
    setQuery(selectedQuery);
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(selectedQuery)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      console.error("Logout function is not defined");
    }
  };

  const isActive = (path) =>
    location.pathname === path ? "text-primary font-semibold" : "";

  // Hàm kiểm tra và trả về URL ảnh avatar
  const getAvatarUrl = () => {
    console.log("Getting avatar URL for user:", currentUser);

    // Kiểm tra từ currentUser trước
    if (currentUser?.photoURL) {
      console.log("Using photoURL from currentUser:", currentUser.photoURL);
      return currentUser.photoURL;
    }

    // Sau đó kiểm tra từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.photoURL) {
        console.log("Using photoURL from localStorage:", userData.photoURL);
        return userData.photoURL;
      }
    }

    // Cuối cùng sử dụng ảnh mặc định
    console.log("Using default avatar");
    return avatarImg;
  };

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center md:gap-10">
          <Link to="/">
            <img className="w-16 object-cover ml-8" src={logo} alt="Logo" />
          </Link>

          {/* Search input */}
          <div className="relative sm:w-72 w-40" ref={searchRef}>
            <button onClick={handleSearch}>
              <IoSearchOutline className="absolute inline-block left-3 inset-y-2" />
            </button>
            <input
              type="text"
              placeholder={t("common.search")}
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline"
            />
            {showSuggestions && query.length >= 2 && (
              <SearchSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>

          {/* Navigation Links */}
          <Link to="/" className={`hover:text-primary ${isActive("/")}`}>
            {t("common.home")}
          </Link>
          <Link
            to="/product"
            className={`hover:text-primary ${isActive("/product")}`}
          >
            {t("common.books")}
          </Link>
          <Link
            to="/product/bussines"
            className={`hover:text-primary ${isActive("/product/business")}`}
          >
            {t("common.bussines")}
          </Link>
          <Link
            to="/product/fiction"
            className={`hover:text-primary ${isActive("/product/fiction")}`}
          >
            {t("common.fiction")}
          </Link>
          <Link
            to="/product/adventure"
            className={`hover:text-primary ${isActive("/product/adventure")}`}
          >
            {t("common.adventure")}
          </Link>
          <Link
            to="/product/manga"
            className={`hover:text-primary ${isActive("/product/manga")}`}
          >
            {t("common.manga")}
          </Link>
        </div>

        {/* Right side */}
        <div className="relative flex items-center md:space-x-2">
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={getAvatarUrl()}
                    alt="User Avatar"
                    className="size-7 rounded-full ring-2 ring-blue-500 object-cover"
                    onError={(e) => {
                      console.log("Error loading avatar, using default");
                      e.target.onerror = null;
                      e.target.src = avatarImg;
                    }}
                  />
                </button>
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
                            {t(`common.${item.name.toLowerCase()}`)}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {t("common.logout")}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">
                <FaRegUser className="size-6" />
              </Link>
            )}
          </div>

          <Link to="/wishlist" className="relative">
            <FaRegHeart className="size-6" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

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
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
