/* eslint-disable no-unused-vars */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import {
  FaRegUser,
  FaRegHeart,
  FaCartShopping,
  FaBars,
  FaChevronDown,
} from "react-icons/fa6";
import { RiBookOpenLine, RiSparklingFill } from "react-icons/ri";
import avatarImg from "../assets/avatar.png";
import { useSelector } from "react-redux";
import { useAuth } from "./../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchSuggestions from "./SearchSuggestions";
import {
  useGetSearchSuggestionsQuery,
  useAddSearchHistoryMutation,
  useGetSearchHistoryQuery,
  useDeleteSearchHistoryMutation,
} from "../redux/features/search/searchApi";
import { debounce } from "lodash";
import SearchHistory from "./SearchHistory";
import gsap from "gsap";
import "../styles/nav.css";
import { useGetNotificationsQuery } from "../redux/features/notifications/notificationsApi";

const navigation = [
  { name: "Profile", href: "/profile", icon: "👤" },
  { name: "Orders", href: "/orders", icon: "📦" },
  { name: "Cart Page", href: "/cart", icon: "🛒" },
  { name: "Notifications", href: "/notifications", icon: "🔔" },
];

const categories = [
  {
    name: "Books",
    href: "/product",
    icon: "📚",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Business",
    href: "/product/business",
    icon: "💼",
    color: "from-green-500 to-green-600",
  },
  {
    name: "Fiction",
    href: "/product/fiction",
    icon: "📖",
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Adventure",
    href: "/product/adventure",
    icon: "🗺️",
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "Manga",
    href: "/product/manga",
    icon: "🎌",
    color: "from-pink-500 to-pink-600",
  },
];

const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const EnhancedNavbar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestedText, setSuggestedText] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();

  const searchRef = useRef(null);
  const categoryRef = useRef(null);
  const dropdownRef = useRef(null);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const inputRef = useRef(null);

  const [deleteSearchHistory] = useDeleteSearchHistoryMutation();
  const [addSearchHistory] = useAddSearchHistoryMutation();

  // API calls
  const { data: suggestions } = useGetSearchSuggestionsQuery(query, {
    skip: !query || query.length < 2,
  });

  const { data: searchHistoryData } = useGetSearchHistoryQuery(undefined, {
    skip: !currentUser || !showHistory,
  });

  // Get notifications
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    skip: !currentUser,
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const unreadNotifications =
    notificationsData?.data?.filter((n) => !n.isRead) || [];
  const unreadCount = unreadNotifications.length;

  // Enhanced animations
  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current.children,
        {
          opacity: 0,
          y: -30,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        }
      );
    }

    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
        setIsSearchFocused(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const debouncedSearch = debounce((value) => {
    if (value.length >= 2) {
      setQuery(value);
      setShowSuggestions(true);
    } else {
      setQuery("");
      setShowSuggestions(false);
    }
  }, 300);

  const handleSmartSearch = (value) => {
    setInputValue(value);
    debouncedSearch(value);

    if (suggestions?.data?.length > 0) {
      const normalizedInput = removeDiacritics(value.toLowerCase());
      const match = suggestions.data.find((suggestion) =>
        removeDiacritics(suggestion.title.toLowerCase()).startsWith(
          normalizedInput
        )
      );

      if (match) {
        setSuggestedText(match.title);
        setShowSuggestion(true);
      } else {
        setSuggestedText("");
        setShowSuggestion(false);
      }
    }
  };

  const handleSearch = async () => {
    if (inputValue.trim()) {
      navigate(`/search?query=${encodeURIComponent(inputValue)}`);
      setShowSuggestions(false);
      setIsSearchFocused(false);

      if (currentUser) {
        try {
          await addSearchHistory({ query: inputValue.trim() }).unwrap();
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
    setIsSearchFocused(false);
    navigate(`/search?query=${encodeURIComponent(selectedQuery)}`);

    if (currentUser) {
      try {
        await addSearchHistory({ query: selectedQuery.trim() }).unwrap();
      } catch (error) {
        console.error("Error tracking search from suggestion:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setShowHistory(false);
      setIsSearchFocused(false);
    } else if (e.key === "Tab" && showSuggestion) {
      e.preventDefault();
      setInputValue(suggestedText);
      setQuery(suggestedText);
      setShowSuggestion(false);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      setIsDropdownOpen(false);
    }
  };

  const getAvatarUrl = () => {
    if (currentUser?.photoURL) return currentUser.photoURL;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.photoURL) return userData.photoURL;
    }

    return avatarImg;
  };

  const handleHistorySelect = (query) => {
    setInputValue(query);
    setQuery(query);
    setShowHistory(false);
    setShowSuggestions(true);
  };

  const handleHistoryDelete = async (historyId) => {
    try {
      await deleteSearchHistory(historyId).unwrap();
    } catch (error) {
      console.error("Error deleting search history:", error);
    }
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    if (currentUser && inputValue.length === 0) {
      setShowHistory(true);
    }
  };

  const handleReset = () => {
    setInputValue("");
    setQuery("");
    setShowSuggestions(false);
    setShowSuggestion(false);
    setSuggestedText("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <motion.header
      ref={navRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          {/* Enhanced Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <RiBookOpenLine className="text-white text-xl" />
              </motion.div>
              <div ref={logoRef} className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BookStore
                </span>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-xs text-gray-500 flex items-center gap-1"
                >
                  <RiSparklingFill className="text-yellow-400" />
                  {t(`common.Discover Amazing Books`)}
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              className="relative"
              ref={searchRef}
              animate={{
                scale: isSearchFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`relative flex items-center bg-gray-50 rounded-2xl transition-all duration-300 ${
                  isSearchFocused
                    ? "ring-2 ring-blue-500 bg-white shadow-lg"
                    : "hover:bg-gray-100 hover:shadow-md"
                }`}
              >
                <motion.button
                  onClick={handleSearch}
                  className="absolute left-4 z-10 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoSearchOutline className="w-5 h-5 text-gray-500" />
                </motion.button>

                <div className="relative w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t("search.search_placeholder")}
                    value={inputValue}
                    onChange={(e) => handleSmartSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    className="w-full py-3 pl-12 pr-16 bg-transparent rounded-2xl focus:outline-none placeholder-gray-400"
                  />
                  {showSuggestion && (
                    <div className="absolute top-0 left-0 w-full py-3 pl-12 pr-16 text-gray-400 pointer-events-none">
                      {suggestedText}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {inputValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleReset}
                      className="absolute right-12 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      <IoClose className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Enhanced Category Dropdown */}
                <div className="relative" ref={categoryRef}>
                  <motion.button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="absolute right-2 flex items-center space-x-1 px-3 py-2 my-[-15px] rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaBars className="w-4 h-4" />
                    <motion.div
                      animate={{ rotate: isCategoryOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="w-3 h-3" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-2">
                          {categories.map((category, index) => (
                            <motion.div
                              key={category.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                to={category.href}
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                                onClick={() => setIsCategoryOpen(false)}
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}
                                >
                                  <span className="text-lg">
                                    {category.icon}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                    {t(`common.${category.name.toLowerCase()}`)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Explore {category.name.toLowerCase()}
                                  </p>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Search Suggestions & History */}
              <AnimatePresence>
                {showHistory && currentUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchHistory
                      history={searchHistoryData?.data}
                      onSelect={handleHistorySelect}
                      onDelete={handleHistoryDelete}
                    />
                  </motion.div>
                )}

                {showSuggestions && query.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchSuggestions
                      suggestions={suggestions}
                      onSelect={handleSuggestionSelect}
                      onClose={() => setShowSuggestions(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Enhanced Right Navigation */}
          <div className="flex items-center space-x-6">
            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              {currentUser ? (
                <>
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <img
                        src={getAvatarUrl() || "/placeholder.svg"}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = avatarImg;
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      />
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <p className="font-semibold">
                            {currentUser?.displayName ||
                              currentUser?.fullName ||
                              (() => {
                                const storedUser = localStorage.getItem("user");
                                if (storedUser) {
                                  try {
                                    const userData = JSON.parse(storedUser);
                                    return (
                                      userData.displayName ||
                                      userData.fullName ||
                                      "User"
                                    );
                                  } catch (e) {
                                    return "User";
                                  }
                                }
                                return "User";
                              })()}
                          </p>
                          <p className="text-sm opacity-90">
                            {currentUser?.email || ""}
                          </p>
                        </div>
                        <div className="p-2">
                          {navigation.map((item, index) => (
                            <motion.div
                              key={item.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                to={item.href}
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                                  {t(
                                    `common.${item.name
                                      .toLowerCase()
                                      .replace(" ", "_")}`
                                  )}
                                </span>
                                {item.name === "Notifications" &&
                                  unreadCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                      {unreadCount}
                                    </span>
                                  )}
                              </Link>
                            </motion.div>
                          ))}
                          <hr className="my-2 border-gray-200" />
                          <motion.button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-red-50 transition-all duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-lg">🚪</span>
                            <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors duration-200">
                              {t("common.logout")}
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md"
                  >
                    <FaRegUser className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Login</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Enhanced Wishlist */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl transition-all duration-200"
              >
                <FaRegHeart className="w-6 h-6 text-gray-600" />
                <AnimatePresence>
                  {wishlistItems.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md px-2 mx-[-17px] my-[24px] "
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Enhanced Cart */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cart"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md relative"
              >
                <FaCartShopping className="w-5 h-5" />
                <span className="font-semibold">{cartItems.length || 0}</span>
                <AnimatePresence>
                  {cartItems.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                    />
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Language Switcher */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LanguageSwitcher />
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaBars className="w-5 h-5 text-gray-600" />
              </motion.div>
            </motion.button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 p-4 bg-gray-50 rounded-2xl"
            >
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={category.href}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-700">
                        {t(`common.${category.name.toLowerCase()}`)}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default EnhancedNavbar;
