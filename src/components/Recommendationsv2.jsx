/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useGetCollaborativeRecommendationsQuery } from "../redux/features/recommendationv2/recommendationsv2Api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaRobot, FaMagic } from "react-icons/fa";
import {
  RiAiGenerate,
  RiUserHeartFill,
  RiStarSFill,
  RiSparkling2Fill,
  RiSparklingFill,
} from "react-icons/ri";
import BookCard from "./../pages/books/BookCart";
import "../styles/recommendv2.css";
gsap.registerPlugin(ScrollTrigger);

const EnhancedRecommendationsv2 = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const titleRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { data, error, isLoading, refetch } =
    useGetCollaborativeRecommendationsQuery(undefined, {
      skip: !currentUser,
    });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Listen for user changes and refetch recommendations
  useEffect(() => {
    const handleUserChanged = () => {
      console.log("User changed, refetching recommendations...");
      // Delay to ensure token is set
      setTimeout(() => {
        if (currentUser) {
          refetch();
        }
      }, 500);
    };

    const handleUserLoggedIn = () => {
      console.log("User logged in, refetching recommendations...");
      // Delay to ensure token is set
      setTimeout(() => {
        if (currentUser) {
          refetch();
        }
      }, 500);
    };

    window.addEventListener("userChanged", handleUserChanged);
    window.addEventListener("userLoggedIn", handleUserLoggedIn);

    // Also refetch when currentUser changes (e.g., on mount after login)
    if (currentUser) {
      const timeoutId = setTimeout(() => {
        refetch();
      }, 1000);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("userChanged", handleUserChanged);
        window.removeEventListener("userLoggedIn", handleUserLoggedIn);
      };
    }

    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
      window.removeEventListener("userLoggedIn", handleUserLoggedIn);
    };
  }, [currentUser, refetch]);

  useEffect(() => {
    if (data?.data?.length > 0 && isInView) {
      // Enhanced title animation
      gsap.fromTo(
        titleRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.8,
          rotationX: -45,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.2,
        }
      );

      // Staggered card animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            {
              y: 80,
              opacity: 0,
              scale: 0.8,
              rotationY: -15,
            },
            {
              scrollTrigger: {
                trigger: card,
                start: "top bottom-=50",
                toggleActions: "play none none reverse",
              },
              y: 0,
              opacity: 1,
              scale: 1,
              rotationY: 0,
              duration: 0.8,
              delay: index * 0.1,
              ease: "power2.out",
            }
          );
        }
      });
    }
  }, [data, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-16 overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-4 mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <RiAiGenerate className="text-6xl text-blue-500" />
              <RiSparkling2Fill className="text-4xl text-purple-500" />
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {t("loading")}
            </motion.h2>

            <motion.p
              className="text-gray-600 text-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              AI is analyzing your preferences...
            </motion.p>

            {/* Loading Animation */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-red-500 text-6xl mb-4"
            >
              ⚠️
            </motion.div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">
              {t("error")}
            </h3>
            <p className="text-red-500">{error.message}</p>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      className="relative py-16 overflow-hidden"
    >
      {/* Enhanced Background with Floating Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* AI Badge */}
          <motion.div
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg border border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <RiAiGenerate className="text-2xl text-blue-500" />
            </motion.div>
            <span className="text-gray-700 font-semibold"></span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <RiSparklingFill className="text-purple-500" />
            </motion.div>
          </motion.div>

          {/* Main Title */}
          <motion.h2
            ref={titleRef}
            className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {t("recommendations.for_you")}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {t("recommendations.subtitle")}
          </motion.p>

          {/* User Stats */}
          <motion.div
            className="flex justify-center items-center gap-8 mt-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <RiUserHeartFill className="text-red-500 text-xl" />
              <span className="font-semibold">
                {t("recommendations.personalized")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <RiStarSFill className="text-yellow-500 text-xl" />
              <span className="font-semibold">
                {t("recommendations.high_quality")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaMagic className="text-purple-500 text-xl" />
              <span className="font-semibold">
                {t("recommendations.ai_enhanced")}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            {/* Decorative Corner Elements */}
            <motion.div
              className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
              animate={{ rotate: -360, scale: [1.2, 1, 1.2] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-4 left-4 w-10 h-10 bg-gradient-to-br from-pink-400 to-red-400 rounded-full"
              animate={{ rotate: 180, scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-4 right-4 w-7 h-7 bg-gradient-to-br from-blue-400 to-green-400 rounded-full"
              animate={{ rotate: -180, scale: [1.1, 1, 1.1] }}
              transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY }}
            />

            <AnimatePresence>
              {data?.data?.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8"
                >
                  {data.data.map((book, index) => {
                    const price = book.price || {};
                    const newPrice =
                      Number(price.newPrice) || Number(book.price) || 0;
                    const oldPrice =
                      Number(price.oldPrice) || Math.round(newPrice * 1.2);

                    return (
                      <motion.div
                        key={book._id}
                        ref={(el) => (cardsRef.current[index] = el)}
                        variants={itemVariants}
                        className="relative group"
                        onHoverStart={() => setHoveredCard(index)}
                        onHoverEnd={() => setHoveredCard(null)}
                        whileHover={{
                          scale: 1.05,
                          rotateY: 5,
                          z: 50,
                          transition: { duration: 0.3 },
                        }}
                      >
                        {/* AI Recommendation Badge */}
                        <motion.div
                          className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: index * 0.1 + 0.5,
                            duration: 0.5,
                            type: "spring",
                          }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <div className="flex items-center gap-1">
                            <FaRobot className="text-xs" />
                            AI Pick
                          </div>
                        </motion.div>

                        {/* Ranking Badge for top recommendations */}
                        {index < 3 && (
                          <motion.div
                            className="absolute -top-3 -left-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: index * 0.1 + 0.7,
                              duration: 0.5,
                              type: "spring",
                            }}
                            whileHover={{ scale: 1.2, rotate: 360 }}
                          >
                            {index + 1}
                          </motion.div>
                        )}

                        {/* Glow Effect on Hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg blur-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />

                        <motion.div
                          className="relative"
                          style={{ transformStyle: "preserve-3d" }}
                          whileHover={{
                            rotateX: 5,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <BookCard
                            book={{
                              _id: book._id,
                              title: book.title,
                              description: book.description,
                              coverImage: book.coverImage,
                              price: {
                                newPrice: newPrice,
                                oldPrice: oldPrice,
                              },
                              rating: book.rating || 0,
                              totalRatings: book.totalRatings || 0,
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="text-8xl mb-6"
                  >
                    🤖
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">
                    {t("recommendations.no_recommendations")}
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Start exploring books to get personalized recommendations!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      />
    </motion.section>
  );
};

export default EnhancedRecommendationsv2;
