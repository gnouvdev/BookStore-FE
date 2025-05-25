/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaShoppingCart,
  FaHeart,
  FaEye,
  FaStar,
  FaTrophy,
  FaGift,
  FaPercent,
  FaCompass,
  FaShoppingBag,
  FaUsers,
  FaTags,
  FaSpinner,
} from "react-icons/fa";
import {
  RiThunderstormsFill,
  RiRocketFill,
  RiHeartFill,
  RiBrainFill,
} from "react-icons/ri";
import { FaRocket } from "react-icons/fa";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../../redux/features/categories/categoriesApi";
import { useDispatch, useSelector } from "react-redux";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/features/wishlist/wishlistSlice";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const InteractiveBookExplorer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [selectedMood, setSelectedMood] = useState("bestseller");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("3d");
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const particlesRef = useRef(null);

  // API Queries
  const {
    data: booksData,
    isLoading: booksLoading,
    error: booksError,
  } = useGetBooksQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  // Extract data from API responses
  const books = booksData || [];
  const categories = categoriesData || [];

  // Calculate statistics from books data
  const statistics = {
    totalBooks: books.length,
    totalCustomers: 8750, // Mock data since not available in current API
    totalOrders: 234, // Mock data since not available in current API
    totalSales: books.reduce(
      (sum, book) => sum + (book.price?.newPrice || 0),
      0
    ),
  };

  // Transform backend data to match component structure
  const transformedBooks = books.map((book) => ({
    id: book._id,
    title: book.title,
    author: book.author?.name || "Unknown Author",
    authorId: book.author?._id,
    genre: book.category?.name || "Uncategorized",
    categoryId: book.category?._id,
    difficulty: getDifficultyByPages(book.pages),
    rating: book.rating || 0,
    reviews: book.numReviews || 0,
    pages: book.pages || 200,
    cover: book.coverImage || "/placeholder.svg?height=400&width=300",
    description: book.description || "No description available",
    tags: book.tags || [],
    color: getColorByGenre(book.category?.name),
    price: {
      current: book.price?.newPrice || 0,
      original: book.price?.oldPrice || 0,
      discount:
        book.price?.oldPrice && book.price?.newPrice
          ? Math.round(
              ((book.price.oldPrice - book.price.newPrice) /
                book.price.oldPrice) *
                100
            )
          : 0,
    },
    stock: book.quantity || 0,
    bestseller: book.trending || false,
    newArrival: isNewArrival(book.createdAt),
    mood: getMoodByGenre(book.category?.name),
    language: book.language || "Tiếng Anh",
    publish: book.publish || "",
  }));

  // Helper functions
  function getDifficultyByPages(pages) {
    if (!pages) return "medium";
    if (pages < 200) return "easy";
    if (pages > 400) return "hard";
    return "medium";
  }

  function getColorByGenre(genre) {
    const colorMap = {
      Fiction: "#6366f1",
      "Science Fiction": "#f59e0b",
      "Sci-Fi": "#f59e0b",
      Romance: "#ec4899",
      Thriller: "#ef4444",
      Mystery: "#ef4444",
      Biography: "#10b981",
      Memoir: "#10b981",
      "Self-Help": "#8b5cf6",
      "Personal Development": "#8b5cf6",
      Fantasy: "#8b5cf6",
      Horror: "#ef4444",
      "Non-Fiction": "#10b981",
      History: "#f59e0b",
      Philosophy: "#6366f1",
    };
    return colorMap[genre] || "#6366f1";
  }

  function getMoodByGenre(genre) {
    const moodMap = {
      Fiction: "thoughtful",
      "Science Fiction": "adventure",
      "Sci-Fi": "adventure",
      Romance: "romantic",
      Thriller: "suspenseful",
      Mystery: "suspenseful",
      Biography: "inspiring",
      Memoir: "inspiring",
      "Self-Help": "motivational",
      "Personal Development": "motivational",
      Fantasy: "adventure",
      Horror: "suspenseful",
      "Non-Fiction": "thoughtful",
      History: "thoughtful",
      Philosophy: "thoughtful",
    };
    return moodMap[genre] || "thoughtful";
  }

  function isNewArrival(createdAt) {
    if (!createdAt) return false;
    const bookDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return bookDate > thirtyDaysAgo;
  }

  // Transform categories for genre display
  const transformedGenres = categories.map((category) => {
    const categoryBooks = transformedBooks.filter(
      (book) => book.categoryId === category._id
    );
    const totalSales = categoryBooks.reduce(
      (sum, book) => sum + (book.stock || 0),
      0
    );

    return {
      id: category._id,
      label: category.name,
      description: category.description || "",
      books: categoryBooks.length,
      sales: Math.min(totalSales / 10, 100), // Normalize to percentage
      color: getColorByGenre(category.name),
    };
  });

  // Shopping preferences based on actual data
  const shoppingMoods = [
    {
      id: "bestseller",
      label: "Bestsellers",
      icon: FaTrophy,
      color: "#f59e0b",
      description: "Top selling books",
      count: transformedBooks.filter((book) => book.bestseller).length,
    },
    {
      id: "romantic",
      label: "Romance",
      icon: RiHeartFill,
      color: "#ec4899",
      description: "Love stories collection",
      count: transformedBooks.filter((book) => book.mood === "romantic").length,
    },
    {
      id: "thoughtful",
      label: "Philosophy",
      icon: RiBrainFill,
      color: "#6366f1",
      description: "Deep thinking books",
      count: transformedBooks.filter((book) => book.mood === "thoughtful")
        .length,
    },
    {
      id: "suspenseful",
      label: "Thrillers",
      icon: RiThunderstormsFill,
      color: "#ef4444",
      description: "Edge-of-seat stories",
      count: transformedBooks.filter((book) => book.mood === "suspenseful")
        .length,
    },
    {
      id: "inspiring",
      label: "Self-Help",
      icon: FaGift,
      color: "#10b981",
      description: "Personal development",
      count: transformedBooks.filter(
        (book) => book.mood === "inspiring" || book.mood === "motivational"
      ).length,
    },
    {
      id: "adventure",
      label: "Adventure",
      icon: RiRocketFill,
      color: "#8b5cf6",
      description: "Epic journeys",
      count: transformedBooks.filter((book) => book.mood === "adventure")
        .length,
    },
  ];

  // Filter books based on selected preferences
  const filteredBooks = transformedBooks.filter((book) => {
    const moodMatch =
      selectedMood === "all" ||
      (selectedMood === "bestseller" && book.bestseller) ||
      book.mood === selectedMood ||
      (selectedMood === "inspiring" &&
        (book.mood === "inspiring" || book.mood === "motivational"));

    const categoryMatch =
      selectedCategory === "all" || book.categoryId === selectedCategory;
    return moodMatch && categoryMatch;
  });

  // Shopping functions
  const handleAddToCart = async (book, e) => {
    e.stopPropagation();
    try {
      await addToCart({
        bookId: book.id,
        quantity: 1,
      }).unwrap();
      toast.success(t("cart.added_to_cart"));
    } catch (error) {
      toast.error(error.data?.message || t("cart.add_failed"));
    }
  };

  const handleWishlistToggle = (book, e) => {
    e.stopPropagation();
    if (wishlistItems.some((item) => item._id === book.id)) {
      dispatch(removeFromWishlist(book.id));
    } else {
      // Format book data to match the expected structure
      const formattedBook = {
        _id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.cover,
        price: {
          newPrice: book.price.current,
          oldPrice: book.price.original,
        },
        rating: book.rating,
        numReviews: book.reviews,
        description: book.description,
        category: {
          _id: book.categoryId,
          name: book.genre,
        },
        stock: book.stock,
        language: book.language,
        pages: book.pages,
        publish: book.publish,
        tags: book.tags,
      };
      dispatch(addToWishlist(formattedBook));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Animate container on mount
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      // Floating particles animation
      gsap.to(".particle", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        rotation: "random(-180, 180)",
        duration: "random(3, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2,
      });

      // Stats counter animation
      ScrollTrigger.create({
        trigger: ".stats-section",
        start: "top 80%",
        onEnter: () => {
          gsap.to(".stat-number", {
            textContent: (i, target) => target.dataset.value,
            duration: 2,
            ease: "power2.out",
            snap: { textContent: 1 },
            stagger: 0.2,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [filteredBooks.length]);

  // Handle preference selection
  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    setCurrentBookIndex(0); // Reset to first book

    // Animate mood change
    gsap.to(".book-card", {
      scale: 0.8,
      opacity: 0.5,
      duration: 0.3,
      stagger: 0.1,
      onComplete: () => {
        gsap.to(".book-card", {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        });
      },
    });
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentBookIndex(0); // Reset to first book
  };

  // Handle book selection
  const handleBookSelect = (index) => {
    setCurrentBookIndex(index);
  };

  const currentBook = filteredBooks[currentBookIndex] || filteredBooks[0];
  const isInWishlist =
    currentBook && wishlistItems.some((item) => item._id === currentBook.id);

  // Pagination for grid view
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMood, selectedCategory]);

  // Loading state
  if (booksLoading || categoriesLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl text-white font-bold mb-2">
            Loading Book Explorer...
          </h2>
          <p className="text-gray-400">
            Fetching the latest books and categories
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (booksError) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-red-400 mb-4">⚠️</div>
          <h2 className="text-2xl text-white font-bold mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-400 mb-4">
            Failed to fetch books data from server
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
    >
      {/* Animated Background Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <FaCompass className="text-5xl text-purple-400" />
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Book Explorer
            </h2>
          </div>
          <p className="text-xl text-gray-300 mb-8">
            Discover and purchase your next favorite book with our interactive
            shopping experience
          </p>

          {/* Shopping Cart Info */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <FaShoppingCart className="text-purple-400" />
              <span className="text-white font-semibold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <FaHeart className="text-pink-400" />
              <span className="text-white font-semibold">
                {wishlistItems.length} saved
              </span>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            {["3d", "grid", "list"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  viewMode === mode
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {mode.toUpperCase()} View
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Shopping Preferences */}
      <div className="relative z-10 px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            What are you looking for?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shoppingMoods.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <motion.button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`relative p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 group ${
                    selectedMood === mood.id
                      ? "bg-white/20 border-white/30 shadow-lg shadow-purple-500/25"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background:
                      selectedMood === mood.id
                        ? `linear-gradient(135deg, ${mood.color}20, ${mood.color}10)`
                        : undefined,
                  }}
                >
                  <IconComponent
                    className="text-3xl mb-3 mx-auto transition-colors duration-300"
                    style={{ color: mood.color }}
                  />
                  <h4 className="text-white font-semibold mb-1">
                    {mood.label}
                  </h4>
                  <p className="text-gray-400 text-sm">{mood.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {mood.count} books
                  </div>

                  {selectedMood === mood.id && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 opacity-50"
                      style={{ borderColor: mood.color }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.5 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="relative z-10 px-6 mb-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Shop by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <motion.button
              onClick={() => handleCategorySelect("all")}
              className={`relative p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-white/20 border-white/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <h4 className="text-white font-semibold mb-1">
                  All Categories
                </h4>
                <p className="text-gray-400 text-sm">
                  {transformedBooks.length} books
                </p>
              </div>
            </motion.button>

            {transformedGenres.map((genre) => (
              <motion.button
                key={genre.id}
                onClick={() => handleCategorySelect(genre.id)}
                className={`relative p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                  selectedCategory === genre.id
                    ? "bg-white/20 border-white/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.05 }}
                style={{
                  background: `linear-gradient(135deg, ${genre.color}20, ${genre.color}10)`,
                }}
              >
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-1">
                    {genre.label}
                  </h4>
                  <p className="text-gray-400 text-sm">{genre.books} books</p>
                  {genre.description && (
                    <p className="text-gray-500 text-xs mt-1 truncate">
                      {genre.description}
                    </p>
                  )}
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(genre.sales, 100)}%`,
                        backgroundColor: genre.color,
                      }}
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Book Display */}
            <div className="lg:col-span-2">
              {filteredBooks.length === 0 ? (
                <div className="text-center py-16">
                  <FaCompass className="text-8xl text-gray-400 mx-auto opacity-60 mb-6" />
                  <p className="text-white text-2xl font-bold mb-4">
                    No books found
                  </p>
                  <p className="text-gray-400 text-lg">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === "3d" && (
                    <div ref={carouselRef} className="relative h-[500px]">
                      {/* Improved 3D Carousel */}
                      <div className="flex items-center justify-center h-full">
                        <div className="relative w-full max-w-6xl">
                          {/* Navigation Arrows */}
                          <button
                            onClick={() =>
                              setCurrentBookIndex((prev) =>
                                prev > 0 ? prev - 1 : filteredBooks.length - 1
                              )
                            }
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                          >
                            ←
                          </button>
                          <button
                            onClick={() =>
                              setCurrentBookIndex((prev) =>
                                prev < filteredBooks.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                          >
                            →
                          </button>

                          {/* Books Display */}
                          <div className="flex items-center justify-center space-x-10 overflow-visible h-[1000px]">
                            {filteredBooks.map((book, index) => {
                              const isCenter = index === currentBookIndex;
                              const offset = index - currentBookIndex;
                              const maxVisible = 7; // Số sách hiển thị tối đa cùng lúc
                              const isVisible =
                                Math.abs(offset) <= Math.floor(maxVisible / 2);

                              return (
                                <motion.div
                                  key={book.id}
                                  className="book-card cursor-pointer"
                                  onClick={() => handleBookSelect(index)}
                                  animate={{
                                    scale: isCenter ? 1.3 : 0.85,
                                    x: offset * 180, // Tăng khoảng cách giữa các sách
                                    z: isCenter ? 0 : -100,
                                    opacity: isVisible
                                      ? isCenter
                                        ? 1
                                        : 0.7
                                      : 0,
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    ease: "easeInOut",
                                  }}
                                  style={{
                                    transformStyle: "preserve-3d",
                                    position: "absolute",
                                    left: "50%",
                                    transform: `translateX(-50%)`,
                                  }}
                                >
                                  <div className="relative w-52 h-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-2xl">
                                    {/* Badges */}
                                    {book.price.discount > 0 && (
                                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        -{book.price.discount}%
                                      </div>
                                    )}

                                    {book.bestseller && (
                                      <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                        <FaTrophy className="inline mr-1" />
                                        Best
                                      </div>
                                    )}

                                    {book.newArrival && (
                                      <div className="absolute top-8 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        New
                                      </div>
                                    )}

                                    {/* Book Cover */}
                                    <div className="h-72 overflow-hidden">
                                      <img
                                        src={book.cover || "/placeholder.svg"}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src =
                                            "/placeholder.svg?height=400&width=300";
                                        }}
                                      />
                                    </div>

                                    {/* Book Info */}
                                    <div className="p-3">
                                      <h4 className="text-white font-semibold text-sm mb-1 truncate">
                                        {book.title}
                                      </h4>
                                      <p className="text-gray-400 text-xs truncate mb-2">
                                        {book.author}
                                      </p>

                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1">
                                          <FaStar className="text-yellow-400 text-xs" />
                                          <span className="text-white text-xs">
                                            {book.rating.toFixed(1)}
                                          </span>
                                          <span className="text-gray-400 text-xs">
                                            ({book.reviews})
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {book.language}
                                        </div>
                                      </div>

                                      <div className="text-center">
                                        <div className="text-purple-400 font-bold text-sm">
                                          {formatPrice(book.price.current)}
                                        </div>
                                        {book.price.original >
                                          book.price.current && (
                                          <div className="text-gray-400 text-xs line-through">
                                            {formatPrice(book.price.original)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Dots Indicator */}
                          <div className="flex justify-center mt-6 space-x-2">
                            {filteredBooks.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentBookIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                  index === currentBookIndex
                                    ? "bg-purple-400"
                                    : "bg-white/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === "grid" && (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {paginatedBooks.map((book, index) => (
                          <motion.div
                            key={book.id}
                            className="book-card cursor-pointer group"
                            onClick={() => handleBookSelect(index)}
                            whileHover={{ scale: 1.05, y: -10 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-xl">
                              {/* Discount Badge */}
                              {book.price.discount > 0 && (
                                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  -{book.price.discount}%
                                </div>
                              )}

                              {/* Bestseller Badge */}
                              {book.bestseller && (
                                <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                  <FaTrophy className="inline mr-1" />
                                  Best
                                </div>
                              )}

                              {/* New Arrival Badge */}
                              {book.newArrival && (
                                <div className="absolute top-8 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  New
                                </div>
                              )}

                              {/* Quick Actions */}
                              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => handleWishlistToggle(book, e)}
                                  className={`p-2 rounded-full backdrop-blur-md ${
                                    wishlistItems.some(
                                      (item) => item._id === book.id
                                    )
                                      ? "bg-pink-500 shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70"
                                      : "bg-white/20 hover:bg-pink-500"
                                  } transition-all duration-300`}
                                  title={
                                    wishlistItems.some(
                                      (item) => item._id === book.id
                                    )
                                      ? "Đã thêm vào wishlist"
                                      : "Thêm vào wishlist"
                                  }
                                >
                                  <FaHeart
                                    className={`text-white text-sm ${
                                      wishlistItems.some(
                                        (item) => item._id === book.id
                                      )
                                        ? "animate-pulse"
                                        : ""
                                    }`}
                                  />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookSelect(index);
                                  }}
                                  className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-blue-500 transition-colors duration-300"
                                  title="Xem chi tiết"
                                >
                                  <FaEye className="text-white text-sm" />
                                </button>
                              </div>

                              <img
                                src={book.cover || "/placeholder.svg"}
                                alt={book.title}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "/placeholder.svg?height=400&width=300";
                                }}
                              />
                              <div className="p-4">
                                <h4 className="text-white font-semibold mb-1 truncate">
                                  {book.title}
                                </h4>
                                <p className="text-white/70 text-sm truncate mb-2">
                                  {book.author}
                                </p>

                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-400 text-sm" />
                                    <span className="text-white text-sm">
                                      {book.rating.toFixed(1)}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      ({book.reviews})
                                    </span>
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Stock: {book.stock}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-sm text-gray-400">
                                    {book.language}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {book.pages} pages
                                  </div>
                                </div>

                                <div className="text-center mb-3">
                                  <div className="text-purple-400 font-bold text-lg">
                                    {formatPrice(book.price.current)}
                                  </div>
                                  {book.price.original > book.price.current && (
                                    <div className="text-gray-400 text-sm line-through">
                                      {formatPrice(book.price.original)}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={(e) => handleAddToCart(book, e)}
                                  disabled={isLoading || book.stock === 0}
                                  className={`w-full font-semibold py-2 rounded-lg transition-all duration-300 ${
                                    book.stock === 0
                                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
                                  }`}
                                  title={
                                    book.stock === 0
                                      ? "Hết hàng"
                                      : "Thêm vào giỏ hàng"
                                  }
                                >
                                  <FaShoppingCart className="inline mr-2" />
                                  {isLoading
                                    ? t("loading")
                                    : book.stock === 0
                                    ? "Hết hàng"
                                    : t("books.addToCart")}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/10 text-gray-300 rounded-l-md hover:bg-white/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 ${
                              currentPage === page
                                ? "bg-purple-500 text-white"
                                : "bg-white/10 text-gray-300"
                            } hover:bg-white/20 transition-colors duration-300`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white/10 text-gray-300 rounded-r-md hover:bg-white/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Book Details Sidebar */}
            <div className="lg:col-span-1">
              {currentBook && (
                <motion.div
                  key={currentBook.id}
                  className="sticky top-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-6">
                    <img
                      src={currentBook.cover || "/placeholder.svg"}
                      alt={currentBook.title}
                      className="w-32 h-44 object-cover rounded-lg mx-auto mb-4 shadow-lg"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=400&width=300";
                      }}
                    />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {currentBook.title}
                    </h3>
                    <p className="text-gray-400 mb-2">{currentBook.author}</p>
                    <p className="text-gray-500 text-sm mb-4">
                      {currentBook.genre}
                    </p>

                    {/* Rating and Reviews */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="text-white font-semibold">
                          {currentBook.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        ({currentBook.reviews} reviews)
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {formatPrice(currentBook.price.current)}
                      </div>
                      {currentBook.price.original >
                        currentBook.price.current && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-400 line-through">
                            {formatPrice(currentBook.price.original)}
                          </span>
                          <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                            Save{" "}
                            {formatPrice(
                              currentBook.price.original -
                                currentBook.price.current
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed line-clamp-2">
                    {currentBook.description}
                  </p>

                  {/* Book Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-white font-semibold">
                        {currentBook.pages}
                      </div>
                      <div className="text-gray-400 text-sm">Pages</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-white font-semibold">
                        {currentBook.stock}
                      </div>
                      <div className="text-gray-400 text-sm">In Stock</div>
                    </div>
                    {/* <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-white font-semibold">{currentBook.language}</div>
                      <div className="text-gray-400 text-sm">Language</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-white font-semibold">{currentBook.difficulty}</div>
                      <div className="text-gray-400 text-sm">Level</div>
                    </div> */}
                  </div>

                  {/* Publisher */}
                  {currentBook.publish && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-2">
                        Publisher
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {currentBook.publish}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {currentBook.tags && currentBook.tags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentBook.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white/10 text-white text-xs rounded-full border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={(e) => handleAddToCart(currentBook, e)}
                      disabled={isLoading || currentBook.stock === 0}
                      className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 ${
                        currentBook.stock === 0
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
                      }`}
                      title={
                        currentBook.stock === 0
                          ? "Hết hàng"
                          : "Thêm vào giỏ hàng"
                      }
                    >
                      <FaShoppingCart className="inline mr-2" />
                      {isLoading
                        ? t("loading")
                        : currentBook.stock === 0
                        ? "Hết hàng"
                        : t("books.addToCart")}
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={(e) => handleWishlistToggle(currentBook, e)}
                        className={`font-semibold py-2 rounded-lg transition-all duration-300 ${
                          wishlistItems.some(
                            (item) => item._id === currentBook.id
                          )
                            ? "bg-pink-500 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                        title={
                          wishlistItems.some(
                            (item) => item._id === currentBook.id
                          )
                            ? "Đã thêm vào wishlist"
                            : "Thêm vào wishlist"
                        }
                      >
                        <FaHeart
                          className={`inline mr-2 ${
                            wishlistItems.some(
                              (item) => item._id === currentBook.id
                            )
                              ? "animate-pulse"
                              : ""
                          }`}
                        />
                        {wishlistItems.some(
                          (item) => item._id === currentBook.id
                        )
                          ? "Đã lưu"
                          : "Lưu lại"}
                      </button>
                      <button
                        onClick={() =>
                          window.open(`/books/${currentBook.id}`, "_blank")
                        }
                        className="bg-white/10 text-white font-semibold py-2 rounded-lg hover:bg-white/20 transition-all duration-300"
                        title="Xem chi tiết sản phẩm"
                      >
                        <FaEye className="inline mr-2" />
                        Chi tiết
                      </button>
                    </div>
                    <button
                      disabled={currentBook.stock === 0}
                      className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 ${
                        currentBook.stock === 0
                          ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                      }`}
                      title={currentBook.stock === 0 ? "Hết hàng" : "Mua ngay"}
                    >
                      <FaShoppingBag className="inline mr-2" />
                      {currentBook.stock === 0 ? "Hết hàng" : "Mua ngay"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Statistics */}
      <div className="stats-section relative z-10 px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Our Store Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Books Available",
                value: statistics.totalBooks,
                icon: FaShoppingBag,
                color: "#6366f1",
              },
              {
                label: "Categories",
                value: categories.length,
                icon: FaTags,
                color: "#10b981",
              },
              {
                label: "Happy Customers",
                value: statistics.totalCustomers,
                icon: FaUsers,
                color: "#f59e0b",
              },
              {
                label: "Total Value",
                value: statistics.totalSales,
                icon: FaTags,
                color: "#ec4899",
                format: "currency",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon
                  className="text-4xl mx-auto mb-3"
                  style={{ color: stat.color }}
                />
                <div
                  className="stat-number text-3xl font-bold text-white mb-2"
                  data-value={stat.value}
                >
                  {stat.format === "currency"
                    ? formatPrice(stat.value)
                    : stat.value}
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Benefits */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Why Shop With Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Fast Delivery",
                description: "Free shipping on orders over 500k VND",
                icon: FaRocket,
                color: "#f59e0b",
              },
              {
                title: "Best Prices",
                description: "Competitive prices with regular discounts",
                icon: FaPercent,
                color: "#10b981",
              },
              {
                title: "Quality Guarantee",
                description: "100% authentic books with return policy",
                icon: FaTrophy,
                color: "#ec4899",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <benefit.icon
                  className="text-4xl mx-auto mb-3"
                  style={{ color: benefit.color }}
                />
                <h4 className="text-white font-bold mb-2">{benefit.title}</h4>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBookExplorer;
