import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { FaRegUser, FaRegHeart, FaCartShopping, FaBars } from "react-icons/fa6";
import avatarImg from "../assets/avatar.png";
import { useSelector } from "react-redux";
import { useAuth } from "./../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchSuggestions from "./SearchSuggestions";
import {
  useGetSearchSuggestionsQuery,
  useAddSearchHistoryMutation,
} from "../redux/features/search/searchApi";
import { debounce } from "lodash";
import SearchHistory from "./SearchHistory";
import {
  useGetSearchHistoryQuery,
  useDeleteSearchHistoryMutation,
} from "../redux/features/search/searchApi";
import gsap from "gsap";

const navigation = [
  { name: "Profile", href: "/profile" },
  { name: "Orders", href: "/orders" },
  { name: "Cart Page", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
];

const categories = [
  { name: "Books", href: "/product" },
  { name: "Business", href: "/product/bussines" },
  { name: "Fiction", href: "/product/fiction" },
  { name: "Adventure", href: "/product/adventure" },
  { name: "Manga", href: "/product/manga" },
];

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const { currentUser, logout } = useAuth();
  // const location = useLocation();
  const { t } = useTranslation();
  const searchRef = useRef(null);
  const categoryRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [deleteSearchHistory] = useDeleteSearchHistoryMutation();
  const [addSearchHistory] = useAddSearchHistoryMutation();

  // Animation refs
  const categoryMenuRef = useRef(null);
  const logoRef = useRef(null);

  // Lấy suggestions từ API
  const { data: suggestions } = useGetSearchSuggestionsQuery(query, {
    skip: !query || query.length < 2,
  });

  // Get search history
  const { data: searchHistoryData } = useGetSearchHistoryQuery(undefined, {
    skip: !currentUser || !showHistory,
  });

  // Debug currentUser
  useEffect(() => {
    console.log("Current User:", currentUser);
  }, [currentUser]);

  const dropdownRef = useRef(null);

  // Xử lý click outside để đóng suggestions và category menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Animation cho category menu
  useEffect(() => {
    if (categoryMenuRef.current) {
      if (isCategoryOpen) {
        gsap.fromTo(
          categoryMenuRef.current,
          {
            opacity: 0,
            y: -10,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }
    }
  }, [isCategoryOpen]);

  // Animation cho logo text
  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        }
      );
    }
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
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSearch = async () => {
    if (inputValue.trim()) {
      navigate(`/search?query=${encodeURIComponent(inputValue)}`);
      setShowSuggestions(false);

      // Track search history if user is logged in
      if (currentUser) {
        try {
          console.log("Tracking search history for query:", inputValue.trim());
          await addSearchHistory({ query: inputValue.trim() }).unwrap();
          console.log("Search tracked successfully");
        } catch (error) {
          console.error("Error tracking search:", error);
        }
      }
    }
  };

  const handleSuggestionSelect = async (selectedQuery) => {
    setInputValue(selectedQuery);
    setQuery(selectedQuery);
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(selectedQuery)}`);

    // Track search history when selecting a suggestion
    if (currentUser) {
      try {
        console.log(
          "Tracking search history for suggestion:",
          selectedQuery.trim()
        );
        await addSearchHistory({ query: selectedQuery.trim() }).unwrap();
        console.log("Search from suggestion tracked successfully");
      } catch (error) {
        console.error("Error tracking search from suggestion:", error);
      }
    }
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

  // const isActive = (path) =>
  //   location.pathname === path ? "text-primary font-semibold" : "";

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

  // Handle search history selection
  const handleHistorySelect = (query) => {
    setInputValue(query);
    setQuery(query);
    setShowHistory(false);
    setShowSuggestions(true);
  };

  // Handle search history deletion
  const handleHistoryDelete = async (historyId) => {
    try {
      await deleteSearchHistory(historyId).unwrap();
    } catch (error) {
      console.error("Error deleting search history:", error);
    }
  };

  // Update input focus handler
  const handleInputFocus = () => {
    if (currentUser) {
      setShowHistory(true);
    }
    setShowSuggestions(false);
  };

  // Thêm style cho animation và font
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@800&display=swap');
    
    @keyframes dropIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center mx-8">
        {/* Left side - Logo Text */}
        <div className="flex items-center w-40 mx-5">
          <Link to="/" className="text-2xl font-extrabold whitespace-nowrap">
            <span ref={logoRef} className="inline-block">
              {"BookStore".split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-blue-300 transition-all duration-300"
                  style={{
                    opacity: 0,
                    transform: "translateY(-20px)",
                    animation: `dropIn 0.5s ease forwards ${index * 0.1}s`,
                    fontFamily: "'Poppins', sans-serif",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    letterSpacing: "0.5px",
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </Link>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-4xl mx-4">
          <div className="relative flex items-center" ref={searchRef}>
            <button onClick={handleSearch} className="absolute left-4 z-10">
              <IoSearchOutline className="size-5 text-gray-500" />
            </button>
            <input
              type="text"
              placeholder={t("search.search_placeholder")}
              value={inputValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              className="bg-[#EAEAEA] w-full py-2.5 pl-12 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Category Dropdown */}
            <div className="relative ml-2" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                onMouseEnter={() => setIsCategoryOpen(true)}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors bg-[#EAEAEA] p-2 rounded-full"
              >
                <FaBars className="size-5" />
                <span className="hidden md:inline">Categories</span>
              </button>
              {isCategoryOpen && (
                <div
                  ref={categoryMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50"
                  onMouseLeave={() => setIsCategoryOpen(false)}
                >
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="block px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      {t(`common.${category.name.toLowerCase()}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {showHistory && currentUser && (
              <SearchHistory
                history={searchHistoryData?.data}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryDelete}
              />
            )}
            {showSuggestions && query.length >= 2 && (
              <SearchSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>
        </div>

        {/* Right side - Navigation items */}
        <div className="flex items-center space-x-6">
          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={getAvatarUrl()}
                    alt="User Avatar"
                    className="size-7 rounded-full ring-2 ring-blue-500 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = avatarImg;
                    }}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">
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

          {/* Wishlist */}
          <Link to="/wishlist" className="relative">
            <FaRegHeart className="size-6" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
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

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
