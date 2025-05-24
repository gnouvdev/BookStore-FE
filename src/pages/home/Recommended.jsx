/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaFire, FaPercent, FaTrophy } from "react-icons/fa";
import {
  RiFireFill,
  RiSparklingFill,
  RiThunderstormsFill,
} from "react-icons/ri";
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
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

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
        transform: `rotateX(${mousePosition.y * 5 - 2.5}deg) rotateY(${
          mousePosition.x * 5 - 2.5
        }deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Header */}
      <div
        className="relative z-10 mb-8"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              <FaFire className="text-5xl sm:text-6xl text-yellow-300 drop-shadow-2xl" />
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
      <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
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
              delay: 1000,
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
              rotate: 30,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
            className="pb-16"
          >
            {discountedBooks.map((book, index) => (
              <SwiperSlide key={book._id}>
                <div className="relative group">
                  {/* Discount Badge */}
                  {/* <div className="absolute -top-3 -right-3 z-30 bg-gradient-to-r from-yellow-400 to-orange-400 text-red-600 font-bold text-sm px-3 py-2 rounded-full shadow-2xl">
                    -{Math.round(book.discountPercentage)}%
                  </div> */}

                  {/* Hot Badge */}
                  {index < 3 && (
                    <div className="absolute -top-3 -left-3 z-30 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm px-3 py-2 rounded-full shadow-2xl flex items-center gap-1">
                      <RiFireFill className="text-sm" />
                      HOT
                    </div>
                  )}

                  <BookCard book={book} />
                </div>
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
    </div>
  );
};

export default RecommendedWith3D;
