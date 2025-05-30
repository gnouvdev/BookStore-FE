/* eslint-disable no-unused-vars */
"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import images (keeping original structure)
import Banner1 from "../assets/books/banner-1-1.png";
import Banner2 from "../assets/books/banner-1-2.png";
import Banner3 from "../assets/books/banner-2-1.png";
import Banner4 from "../assets/books/banner-2-2.png";
import Banner5 from "../assets/books/banner-5-1.png";
import Banner6 from "../assets/books/banner-5-2.png";
import { Link } from "react-router-dom";
import { t } from "i18next";

// Danh sách ảnh theo thể loại (keeping original structure)
const genreImages = {
  Business1: Banner1,
  Business2: Banner2,
  Horror1: Banner3,
  Horror2: Banner4,
  Adventure1: Banner5,
  Adventure2: Banner6,
};

// Category metadata
const categoryInfo = {
  Business1: {
    title: "Business & Finance",
    color: "bg-blue-500",
    genre: "Business",
  },
  Business2: {
    title: "Leadership",
    color: "bg-purple-500",
    genre: "Business",
  },
  Horror1: {
    title: "Horror & Thriller",
    color: "bg-red-500",
    genre: "Horror",
  },
  Horror2: {
    title: "Mystery",
    color: "bg-gray-700",
    genre: "Horror",
  },
  Adventure1: {
    title: "Adventure",
    color: "bg-green-500",
    genre: "Adventure",
  },
  Adventure2: {
    title: "Fantasy",
    color: "bg-pink-500",
    genre: "Adventure",
  },
};
const SimplifiedMiniBanner = ({ genre1, genre2 }) => {
  // Get image sources based on genre props
  const imageSrc1 = genreImages[genre1] || null;
  const imageSrc2 = genreImages[genre2] || null;

  // Get category info
  const category1 = categoryInfo[genre1] || {
    title: genre1,
    color: "bg-gray-500",
    genre: genre1,
  };
  const category2 = categoryInfo[genre2] || {
    title: genre2,
    color: "bg-gray-500",
    genre: genre2,
  };

  return (
    <div className="py-16 mx-8">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-8 items-center">
        {/* First Banner */}
        {imageSrc1 && (
          <BannerItem
            imageSrc={imageSrc1}
            title={category1.title}
            color={category1.color}
            genre={category1.genre}
          />
        )}

        {/* Second Banner */}
        {imageSrc2 && (
          <BannerItem
            imageSrc={imageSrc2}
            title={category2.title}
            color={category2.color}
            genre={category2.genre}
          />
        )}
      </div>
    </div>
  );
};

// Separate component for each banner item
const BannerItem = ({ imageSrc, title, color, genre }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl shadow-xl group"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={`Banner for ${title}`}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {/* Category Tag */}
        <div
          className={`inline-block px-3 py-1 rounded-full ${color} text-white text-sm font-medium mb-3`}
        >
          {t(`banner.${title}`)}
        </div>

        <h3 className="text-2xl font-bold mb-2">{t(`banner.${title}`)}</h3>
        <p className="text-white/80 text-sm mb-4">
          {t(`banner.${title}`)}
        </p>
        <Link
          to={`/product/${genre}`}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors duration-300"
        >
          {t(`banner.Browse Collection`)}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </motion.div>
  );
};

export default SimplifiedMiniBanner;
