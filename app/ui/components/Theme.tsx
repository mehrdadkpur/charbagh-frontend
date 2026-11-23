'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState(false) 

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const darkMode = savedTheme === 'dark'
    setIsDark(darkMode)
    document.documentElement.classList.toggle('dark', darkMode)
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev
      document.documentElement.classList.toggle('dark', newTheme)
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      return newTheme
    })
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-14 h-8 rounded-full 
                 bg-gray-200 dark:bg-gray-700 transition-colors duration-300 
                 focus:outline-none shadow-inner"
    >
      <motion.div
        className="absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md flex items-center justify-center"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-yellow-400"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M21.75 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-orange-400"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  )
}

export default ThemeSwitcher
