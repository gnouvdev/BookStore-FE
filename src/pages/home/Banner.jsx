/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiPlayFill,
  RiPauseFill,
  RiSparklingFill,
} from "react-icons/ri";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Import your images
import img1 from "../../assets/banner/banner-1.png";
import img2 from "../../assets/banner/banner-2.png";
import img3 from "../../assets/banner/banner-3.png";
import img4 from "../../assets/banner/banner-4.png";
import img5 from "../../assets/banner/banner-5.png";

const BannerWithParticles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const bannerRef = useRef(null);

  const bannerData = [
    {
      id: 1,
      image: img1,
      title: t("banner.title1"),
      subtitle: t("banner.subtitle1"),
      cta: t("banner.cta1"),
      overlay: "from-black/60 via-black/30 to-transparent",
      theme: "dark",
      link: "/product",
    },
    {
      id: 2,
      image: img2,
      title: t("banner.title2"),
      subtitle: t("banner.subtitle2"),
      cta: t("banner.cta2"),
      overlay: "from-blue-900/60 via-blue-600/30 to-transparent",
      theme: "blue",
      link: "/product?category=new-releases",
    },
    {
      id: 3,
      image: img3,
      title: t("banner.title3"),
      subtitle: t("banner.subtitle3"),
      cta: t("banner.cta3"),
      overlay: "from-red-900/60 via-red-600/30 to-transparent",
      theme: "red",
      link: "/product?category=sale",
    },
    {
      id: 4,
      image: img4,
      title: t("banner.title4"),
      subtitle: t("banner.subtitle4"),
      cta: t("banner.cta4"),
      overlay: "from-green-900/60 via-green-600/30 to-transparent",
      theme: "green",
      link: "/product?category=educational",
    },
    {
      id: 5,
      image: img5,
      title: t("banner.title5"),
      subtitle: t("banner.subtitle5"),
      cta: t("banner.cta5"),
      overlay: "from-purple-900/60 via-purple-600/30 to-transparent",
      theme: "purple",
      link: "/product?category=fiction",
    },
  ];

  // Add console.log to check image paths


  // Particle component
  const Particle = ({ delay = 0 }) => (
    <motion.div
      className="absolute w-2 h-2 bg-white/30 rounded-full"
      initial={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        opacity: 0,
      }}
      animate={{
        y: -10,
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        delay: delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const banner = bannerRef.current;
    if (banner) {
      banner.addEventListener("mousemove", handleMouseMove);
      return () => banner.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const toggleAutoplay = () => {
    if (swiperInstance) {
      if (isPlaying) {
        swiperInstance.autoplay.stop();
      } else {
        swiperInstance.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      ref={bannerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1 }}
      className="relative flex flex-col py-2 items-center gap-12 mx-4 md:mx-8 pb-14 overflow-hidden"
    >
      {/* Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Enhanced Swiper */}
      <div className="relative w-full max-w-[1920px] h-[800px] md:h-[600px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
          className="w-full h-full"
        >
          {bannerData.map((banner, index) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-full group">
                {/* Background with Parallax */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${mousePosition.x * 10}px, ${
                      mousePosition.y * 10
                    }px)`,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 30 }}
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      console.error("Error loading image:", banner.image);
                      e.target.onerror = null;
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </motion.div>

                {/* Dynamic Gradient Overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${banner.overlay}`}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Animated Geometric Shapes */}
                <motion.div
                  className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  }}
                />

                <motion.div
                  className="absolute bottom-32 right-32 w-16 h-16 bg-primary/30 rounded-lg backdrop-blur-sm"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 45, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />

                {/* Content with Enhanced Animations */}
                <div className="absolute inset-0 flex items-center justify-start">
                  <div className="max-w-2xl mx-8 md:mx-16 text-white">
                    <AnimatePresence mode="wait">
                      {currentSlide === index && (
                        <motion.div
                          key={`content-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 50, rotateX: 90 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mb-4"
                          >
                            <RiSparklingFill className="w-8 h-8 text-primary mb-4" />
                            <h1 className="text-4xl md:text-6xl font-bold font-primary leading-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                              {banner.title}
                            </h1>
                          </motion.div>

                          <motion.p
                            className="text-lg md:text-xl mb-8 font-secondary opacity-90 leading-relaxed"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          >
                            {banner.subtitle}
                          </motion.p>

                          <motion.button
                            className="group relative btn-primary overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 20px 40px rgba(255, 206, 26, 0.3)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(banner.link)}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              {banner.cta}
                              <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                →
                              </motion.span>
                            </span>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "100%" }}
                              transition={{ duration: 0.6 }}
                            />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Enhanced Navigation */}
        <motion.button
          className="custom-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all duration-300 group border border-white/20"
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <RiArrowLeftSLine className="w-6 h-6" />
        </motion.button>

        <motion.button
          className="custom-next absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all duration-300 group border border-white/20"
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <RiArrowRightSLine className="w-6 h-6" />
        </motion.button>

        {/* Enhanced Controls */}
        <motion.button
          onClick={toggleAutoplay}
          className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isPlaying ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isPlaying ? (
              <RiPauseFill className="w-5 h-5" />
            ) : (
              <RiPlayFill className="w-5 h-5" />
            )}
          </motion.div>
        </motion.button>

        {/* Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            key={currentSlide}
          />
        </div>
      </div>

      {/* Enhanced Slide Counter */}
      <motion.div
        className="absolute bottom-8 left-8 z-20 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full text-white font-secondary border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {String(currentSlide + 1).padStart(2, "0")} /{" "}
            {String(bannerData.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1">
            {bannerData.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSlide ? "bg-primary" : "bg-white/30"
                }`}
                animate={{
                  scale: index === currentSlide ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BannerWithParticles;
