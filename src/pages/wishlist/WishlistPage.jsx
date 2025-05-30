/* eslint-disable no-unused-vars */
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Search, Grid, List } from "lucide-react";
import BookCard from "../books/BookCart";
import { useTranslation } from "react-i18next";
import { fetchWishlist } from "../../redux/features/wishlist/wishlistSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const ImprovedWishlistPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { wishlistItems, loading, error } = useSelector(
    (state) => state.wishlist
  );
  console.log("Wishlist items:", wishlistItems);
  console.log("First book:", wishlistItems[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, price-low, price-high

  useEffect(() => {
    console.log("WishlistPage mounted, fetching wishlist...");
    dispatch(fetchWishlist());
  }, [dispatch]);

  useEffect(() => {
    console.log("Wishlist state updated:", { wishlistItems, loading, error });
  }, [wishlistItems, loading, error]);

  // Filter and sort wishlist items
  const filteredAndSortedItems = wishlistItems
    .filter(
      (book) =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-low":
          return (
            (a.price?.newPrice || a.price?.oldPrice || 0) -
            (b.price?.newPrice || b.price?.oldPrice || 0)
          );
        case "price-high":
          return (
            (b.price?.newPrice || b.price?.oldPrice || 0) -
            (a.price?.newPrice || a.price?.oldPrice || 0)
          );
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  if (loading) {
    console.log("Wishlist is loading...");
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
              >
                <div className="animate-pulse p-6 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Wishlist error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Wishlist
            </h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => dispatch(fetchWishlist())}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  console.log("Rendering wishlist items:", wishlistItems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {t("wishlist.title")}
                  </h1>
                  <p className="text-gray-500">
                    {wishlistItems.length > 0
                      ? `${wishlistItems.length} ${
                          wishlistItems.length === 1 ? "book" : "books"
                        } in your wishlist`
                      : "Your wishlist is empty"}
                  </p>
                </div>
              </div>

              {wishlistItems.length > 0 && (
                <div className="flex items-center space-x-3">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-md"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-md"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filter */}
            {wishlistItems.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 border-gray-200/50 focus:bg-white"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/70 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {wishlistItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="w-12 h-12 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("wishlist.empty")}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Start building your wishlist by adding books you love. Click
                  the heart icon on any book to save it here.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <a href="/">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Browse Books
                  </a>
                </Button>
              </motion.div>
            ) : (
              <div className="p-6">
                <AnimatePresence>
                  {filteredAndSortedItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No books found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter criteria
                      </p>
                    </motion.div>
                  ) : (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                          : "space-y-4"
                      }
                    >
                      {filteredAndSortedItems.map((book, index) => (
                        <motion.div
                          key={book._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={
                            viewMode === "list"
                              ? "flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                              : ""
                          }
                        >
                          <BookCard
                            book={{
                              _id: book._id,
                              title: book.title,
                              description: book.description,
                              coverImage: book.coverImage,
                              price: {
                                newPrice: book.price?.newPrice || 0,
                                oldPrice: book.price?.oldPrice || 0,
                              },
                              rating: book.rating ? parseFloat(book.rating) : 0,
                              totalRatings: book.totalRatings
                                ? parseInt(book.totalRatings)
                                : 0,
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImprovedWishlistPage;
