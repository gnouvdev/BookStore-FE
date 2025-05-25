/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaBook,
  FaUsers,
  FaGlobe,
  FaHeart,
  FaAward,
  FaRocket,
  FaLightbulb,
  FaHandshake,
  FaQuoteLeft,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaShippingFast,
  FaShieldAlt,
} from "react-icons/fa";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState("mission");
  const [counters, setCounters] = useState({
    books: 0,
    customers: 0,
    countries: 0,
    years: 0,
  });

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const teamRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const targets = [
      { key: "books", target: 50000 },
      { key: "customers", target: 100000 },
      { key: "countries", target: 50 },
      { key: "years", target: 15 },
    ];

    targets.forEach(({ key, target }) => {
      gsap.to(counters, {
        [key]: target,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          setCounters({ ...counters });
        },
      });
    });
  };

  // GSAP Animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Hero animation
      gsap.fromTo(
        ".hero-content",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      // Timeline animation
      gsap.fromTo(
        ".timeline-item",
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 80%",
            end: "bottom 20%",
          },
        }
      );

      // Team cards animation
      gsap.fromTo(
        ".team-card",
        { opacity: 0, y: 50, rotationY: 45 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".team-grid",
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  const stats = [
    {
      icon: FaBook,
      label: "Books Available",
      value: counters.books,
      suffix: "+",
    },
    {
      icon: FaUsers,
      label: "Happy Customers",
      value: counters.customers,
      suffix: "+",
    },
    {
      icon: FaGlobe,
      label: "Countries Served",
      value: counters.countries,
      suffix: "",
    },
    {
      icon: FaAward,
      label: "Years of Excellence",
      value: counters.years,
      suffix: "",
    },
  ];

  const values = [
    {
      icon: FaHeart,
      title: "Passion for Books",
      description:
        "We believe in the transformative power of reading and are passionate about connecting people with the perfect book.",
    },
    {
      icon: FaLightbulb,
      title: "Innovation",
      description:
        "We continuously innovate to provide the best book discovery and shopping experience for our customers.",
    },
    {
      icon: FaHandshake,
      title: "Trust & Quality",
      description:
        "We maintain the highest standards of quality and build lasting relationships based on trust and reliability.",
    },
    {
      icon: FaRocket,
      title: "Growth & Learning",
      description:
        "We foster a culture of continuous learning and growth, both for our team and our customers.",
    },
  ];

  const timeline = [
    {
      year: "2009",
      title: "The Beginning",
      description:
        "Started as a small local bookstore with a dream to make books accessible to everyone.",
      icon: FaBook,
    },
    {
      year: "2012",
      title: "Going Digital",
      description:
        "Launched our online platform, expanding our reach beyond geographical boundaries.",
      icon: FaGlobe,
    },
    {
      year: "2015",
      title: "Mobile Revolution",
      description:
        "Introduced our mobile app, making book shopping convenient and accessible anywhere.",
      icon: FaRocket,
    },
    {
      year: "2018",
      title: "AI Recommendations",
      description:
        "Implemented AI-powered book recommendations to help customers discover their next favorite read.",
      icon: FaLightbulb,
    },
    {
      year: "2021",
      title: "Global Expansion",
      description:
        "Expanded to serve customers in over 50 countries worldwide.",
      icon: FaAward,
    },
    {
      year: "2024",
      title: "Future Forward",
      description:
        "Continuing to innovate with new technologies and sustainable practices.",
      icon: FaStar,
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Passionate reader and entrepreneur with 15+ years in the publishing industry.",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sarah@bookstore.com",
      },
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Tech visionary leading our digital transformation and innovation initiatives.",
      social: {
        linkedin: "#",
        github: "#",
        email: "michael@bookstore.com",
      },
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Curation",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Literature expert ensuring we offer the finest selection of books across all genres.",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "emily@bookstore.com",
      },
    },
    {
      name: "David Kim",
      role: "Customer Experience Director",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Dedicated to creating exceptional experiences for every customer interaction.",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "david@bookstore.com",
      },
    },
  ];

  const testimonials = [
    {
      name: "Alice Thompson",
      role: "Book Blogger",
      content:
        "BookStore has revolutionized how I discover new books. Their recommendations are always spot-on!",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Teacher",
      content:
        "As an educator, I appreciate their extensive collection and fast delivery. Highly recommended!",
      rating: 5,
    },
    {
      name: "Maria Garcia",
      role: "Student",
      content:
        "Great prices, excellent customer service, and a user-friendly website. My go-to bookstore!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
          style={{ y }}
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 text-center text-white px-4 hero-content">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <FaBook className="text-6xl" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            About BookStore
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Connecting readers with their perfect books since 2009. We're more
            than just a bookstore – we're a community of book lovers dedicated
            to spreading the joy of reading.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Our Story
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
              Meet the Team
            </button>
          </motion.div>
        </div>

        {/* Floating Books Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: Math.random() * 360,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            >
              <FaBook className="text-4xl" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <stat.icon className="text-3xl text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {Math.floor(stat.value).toLocaleString()}
                  {stat.suffix}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Our Foundation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on strong values and a clear vision for the future of
              reading
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-2 shadow-lg">
              {["mission", "vision", "values"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {activeTab === "mission" && (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <FaRocket className="text-4xl text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">
                  Our Mission
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To make reading accessible, enjoyable, and transformative for
                  everyone. We strive to connect readers with books that
                  inspire, educate, and entertain, while fostering a global
                  community of book lovers who share our passion for literature
                  and learning.
                </p>
              </div>
            )}

            {activeTab === "vision" && (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FaLightbulb className="text-4xl text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">
                  Our Vision
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become the world's most trusted and innovative book
                  platform, where every reader can discover their next favorite
                  book through personalized recommendations, community insights,
                  and cutting-edge technology that enhances the reading
                  experience.
                </p>
              </div>
            )}

            {activeTab === "values" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-16 h-16 mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <value.icon className="text-2xl text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-4">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small local bookstore to a global platform serving millions
              of readers
            </p>
          </motion.div>

          <div className="timeline-container max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className={`timeline-item flex items-center mb-12 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className={`w-1/2 ${
                    index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                  }`}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>

                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg z-10">
                  <item.icon className="text-2xl text-white" />
                </div>

                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        ref={teamRef}
        className="py-20 bg-gradient-to-r from-gray-50 to-blue-50"
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind BookStore's success
            </p>
          </motion.div>

          <div className="team-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="team-card bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                whileHover={{ y: -10, rotateY: 5 }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {member.name}
                  </h3>
                  <div className="text-blue-600 font-semibold mb-3">
                    {member.role}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

                  <div className="flex gap-3">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors duration-300"
                      >
                        <FaLinkedin className="text-sm" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors duration-300"
                      >
                        <FaTwitter className="text-sm" />
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition-colors duration-300"
                      >
                        <FaGithub className="text-sm" />
                      </a>
                    )}
                    <a
                      href={`mailto:${member.social.email}`}
                      className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors duration-300"
                    >
                      <FaEnvelope className="text-sm" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              What People Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our satisfied customers and partners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FaQuoteLeft className="text-3xl text-blue-500 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose BookStore?
            </h2>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              We're committed to providing the best book shopping experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaShippingFast,
                title: "Fast Delivery",
                description: "Quick and reliable shipping to your doorstep",
              },
              {
                icon: FaShieldAlt,
                title: "Secure Shopping",
                description: "Your data and transactions are always protected",
              },
              {
                icon: FaHeart,
                title: "Customer Care",
                description: "24/7 support from our dedicated team",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <feature.icon className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="opacity-90">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Have questions or want to learn more about our story? We'd love to
              hear from you!
            </p>

            <div className="flex flex-wrap gap-6 justify-center mb-8">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-400" />
                <span>hello@bookstore.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-red-400" />
                <span>123 Book Street, Reading City</span>
              </div>
            </div>

            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us Today
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
