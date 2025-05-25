/* eslint-disable no-unused-vars */
"use client"
import { motion } from "framer-motion"
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      {/* Top Section */}
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BookStore
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your ultimate destination for discovering amazing books. We bring you the best collection of literature
              from around the world.
            </p>
            <div className="flex items-center gap-2 text-gray-300">
              <FaMapMarkerAlt className="text-blue-400" />
              <span>123 Book Street, Reading City</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-xl font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "Books", "Categories", "Authors", "About Us", "Contact"].map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold text-white mb-4">Categories</h4>
            <ul className="space-y-3">
              {["Fiction", "Non-Fiction", "Science", "Technology", "Romance", "Mystery"].map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-xl font-bold text-white mb-4">Stay Updated</h4>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest book releases and exclusive offers!
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-l-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-r-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2">
                  <FaEnvelope />
                  Subscribe
                </button>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <FaPhone className="text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-gray-400 text-center md:text-left">
              <p>&copy; 2024 BookStore. All rights reserved.</p>
              <div className="flex gap-6 mt-2">
                <a href="#privacy" className="hover:text-blue-400 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#terms" className="hover:text-blue-400 transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#cookies" className="hover:text-blue-400 transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: FaFacebook, href: "https://facebook.com", color: "hover:text-blue-500" },
                { icon: FaTwitter, href: "https://twitter.com", color: "hover:text-blue-400" },
                { icon: FaInstagram, href: "https://instagram.com", color: "hover:text-pink-500" },
              ].map(({ icon: Icon, href, color }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 ${color} transition-all duration-300 hover:scale-110 hover:bg-gray-700`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
