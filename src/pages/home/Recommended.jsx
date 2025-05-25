/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFire, FaClock } from "react-icons/fa";
import { RiFireFill } from "react-icons/ri";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import {
  Pagination,
  Navigation,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import { t } from "i18next";
import BookCard from "./../books/BookCart";
import "../../styles/3d-effects.css";

const RecommendedWith3D = () => {
  const { data: books = [], isLoading } = useGetBooksQuery();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Countdown Timer Effect
  useEffect(() => {
    // Set sale end date (7 days from now)
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Tính phần trăm giảm giá và sắp xếp sách
  const discountedBooks = books
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

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-600 p-12 rounded-3xl mx-4 sm:mx-8 lg:mx-16 text-center perspective-1000">
        <div className="inline-block animate-spin">
          <FaFire className="text-8xl text-yellow-300 mb-4 drop-shadow-2xl" />
        </div>
        <div className="text-white text-2xl font-bold">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-600 p-8 sm:p-12 rounded-3xl mx-4 sm:mx-8 lg:mx-16 shadow-2xl perspective-1000"
      style={{
        transform: `rotateX(${(mousePosition.y * 2 - 1) * 0.5}deg) rotateY(${
          (mousePosition.x * 2 - 1) * 0.5
        }deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      {/* Countdown Timer - Top Right */}
      <motion.div
        className="absolute top-4 right-4 z-20 bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FaClock className="text-yellow-300 text-lg animate-pulse" />
          <span className="text-white font-bold text-sm">SALE ENDS IN</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-yellow-300 font-bold text-lg">
              {timeLeft.days}
            </div>
            <div className="text-white text-xs">DAYS</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-yellow-300 font-bold text-lg">
              {timeLeft.hours}
            </div>
            <div className="text-white text-xs">HRS</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-yellow-300 font-bold text-lg">
              {timeLeft.minutes}
            </div>
            <div className="text-white text-xs">MIN</div>
          </div>
          <div className="bg-white/20 rounded-lg p-2">
            <div className="text-yellow-300 font-bold text-lg animate-pulse">
              {timeLeft.seconds}
            </div>
            <div className="text-white text-xs">SEC</div>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <div
        className="relative z-10 mb-8"
        style={{ transform: "translateZ(10px)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              <FaFire className="text-5xl sm:text-6xl text-yellow-300 drop-shadow-2xl animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-5xl text-white font-bold font-primary">
                {t("home.Top Sales")}
              </h2>
              <p className="text-yellow-100 text-base sm:text-lg font-secondary mt-2">
                🔥 {t("home.Hottest deals & biggest discounts")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Books Carousel */}
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {discountedBooks.length > 0 ? (
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 25 },
              768: { slidesPerView: 3, spaceBetween: 30 },
              1024: { slidesPerView: 4, spaceBetween: 35 },
              1280: { slidesPerView: 5, spaceBetween: 40 },
            }}
            centeredSlides={true}
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
              prevEl: ".recommended-3d-prev",
              nextEl: ".recommended-3d-next",
            }}
            effect="coverflow"
            coverflowEffect={{
              rotate: 10,
              stretch: 0,
              depth: 50,
              modifier: 1,
              slideShadows: false,
            }}
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            className="pb-16"
          >
            {discountedBooks.map((book, index) => (
              <SwiperSlide key={book._id}>
                <motion.div
                  className="relative group"
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  style={{
                    filter: "none",
                    willChange: "transform",
                  }}
                >
                  {/* Discount Badge */}
                  {/* <div className="absolute -top-3 -right-3 z-30 bg-gradient-to-r from-yellow-400 to-orange-400 text-red-600 font-bold text-sm px-3 py-2 rounded-full shadow-2xl animate-bounce">
                    -{Math.round(book.discountPercentage)}%
                  </div> */}

                  {/* Hot Badge */}
                  {index < 3 && (
                    <div className="absolute -top-3 -left-3 z-30 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm px-3 py-2 rounded-full shadow-2xl flex items-center gap-1">
                      <RiFireFill className="text-sm" />
                      HOT
                    </div>
                  )}

                  {/* Enhanced Book Card Container */}
                  <div className="relative rounded-2xl transition-all p-4 duration-200">
                    <BookCard book={book} />
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-16">
            <FaFire className="text-8xl text-yellow-300 mx-auto opacity-60 drop-shadow-2xl mb-6" />
            <p className="text-white text-2xl font-bold mb-4">
              {t("home.no_discounts")}
            </p>
            <p className="text-yellow-100 text-lg">
              Check back soon for amazing deals!
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="recommended-3d-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 cursor-pointer transition-all duration-200">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>
      <div className="recommended-3d-next absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 cursor-pointer transition-all duration-200">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"></div>
    </div>
  );
};

export default RecommendedWith3D;
