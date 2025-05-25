/* eslint-disable no-unused-vars */
"use client"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { FaGlobe } from "react-icons/fa"

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  ]

  return (
    <div className="relative group">
      <motion.div
        className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaGlobe className="text-blue-400" />
        <span className="text-white font-medium">
          {languages.find((lang) => lang.code === i18n.language)?.flag || "🌐"}
        </span>
        <span className="text-white text-sm">{i18n.language.toUpperCase()}</span>
      </motion.div>

      {/* Dropdown */}
      <motion.div
        className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
        initial={{ y: -10 }}
        whileHover={{ y: 0 }}
      >
        {languages.map((language) => (
          <motion.button
            key={language.code}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200 ${
              i18n.language === language.code ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
            onClick={() => changeLanguage(language.code)}
            whileHover={{ x: 5 }}
          >
            <span className="text-lg">{language.flag}</span>
            <div>
              <div className="font-medium">{language.name}</div>
              <div className="text-xs text-gray-500">{language.code.toUpperCase()}</div>
            </div>
            {i18n.language === language.code && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

export default LanguageSwitcher
