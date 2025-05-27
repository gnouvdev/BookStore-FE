/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
} from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import { t } from "i18next";
import BookCard from "./../books/BookCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "../../styles/3d-effects.css";
const OptimizedRecommended = () => {
  const { data: books = [], isLoading } = useGetBooksQuery();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  // Memoize processed books để tránh re-calculation
  const discountedBooks = useMemo(() => {
    return books
      .map((book) => ({
        ...book,
        discountPercentage:
          book.price?.oldPrice && book.price?.newPrice
            ? ((book.price.oldPrice - book.price.newPrice) /
                book.price.oldPrice) *
              100
            : 0,
      }))
      .filter((book) => book.discountPercentage > 0)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, 12);
  }, [books]);

  // Optimized countdown timer
  useEffect(() => {
    const saleEndDate = new Date();
    saleEndDate.setDate(saleEndDate.getDate() + 7);
    saleEndDate.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = saleEndDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-8 sm:p-12 rounded-3xl mx-4 sm:mx-8 lg:mx-16 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Flame className="w-10 h-10 text-yellow-300 animate-pulse" />
          </div>
          <div className="text-white text-2xl font-bold">{t("loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 sm:p-8 lg:p-12 rounded-3xl mx-4 sm:mx-8 lg:mx-16 shadow-2xl"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-yellow-300/10 rounded-full blur-lg animate-pulse"></div>
      </div>

      {/* Countdown Timer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 right-4 z-20 bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-yellow-300" />
          <span className="text-white font-bold text-sm">SALE ENDS IN</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: timeLeft.days, label: "DAYS" },
            { value: timeLeft.hours, label: "HRS" },
            { value: timeLeft.minutes, label: "MIN" },
            { value: timeLeft.seconds, label: "SEC" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/20 rounded-lg p-2 text-center min-w-[50px]"
            >
              <div className="text-yellow-300 font-bold text-lg leading-none">
                {item.value}
              </div>
              <div className="text-white text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white font-bold">
                {t("home.Top Sales")}
              </h2>
              <p className="text-yellow-100 text-base sm:text-lg mt-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("home.Hottest deals & biggest discounts")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Books Carousel */}
      <div className="relative z-10">
        {discountedBooks.length > 0 ? (
          <div className="relative">
            <Swiper
              slidesPerView={1}
              spaceBetween={120}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 20 },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              navigation={{
                prevEl: ".recommended-prev",
                nextEl: ".recommended-next",
              }}
              modules={[Autoplay, Pagination, Navigation]}
              className="pb-16"
              style={{
                "--swiper-pagination-color": "#fbbf24",
                "--swiper-pagination-bullet-inactive-color":
                  "rgba(255, 255, 255, 0.5)",
              }}
            >
              {discountedBooks.map((book, index) => (
                <SwiperSlide key={book._id}>
                  <div className="w-full h-full flex flex-col">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex flex-col h-full"
                    >
                      {/* Discount Badge */}
                      {/* <Badge className="absolute -top-2 -right-2 z-30 bg-gradient-to-r from-yellow-400 to-orange-500 text-red-700 font-bold text-sm px-3 py-1 rounded-full shadow-lg border-2 border-white">
                        -{Math.round(book.discountPercentage)}%
                      </Badge> */}

                      {/* Hot Badge for top 3 */}
                      {index < 3 && (
                        <Badge className="absolute -top-2 -left-2 z-30 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          HOT
                        </Badge>
                      )}

                      {/* Book Card Container */}
                      <div className="relative flex-1 rounded-2xl ">
                        <div className="h-full">
                          <BookCard book={book} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-white"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <Flame className="w-12 h-12 text-yellow-300" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-4">
              {t("home.no_discounts")}
            </h3>
            <p className="text-yellow-100 text-lg">
              Check back soon for amazing deals!
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="recommended-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-12 h-12 text-white border border-white/30 transition-all duration-200"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="recommended-next absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full w-12 h-12 text-white border border-white/30 transition-all duration-200"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 pointer-events-none"></div>
    </motion.div>
  );
};

export default OptimizedRecommended;
