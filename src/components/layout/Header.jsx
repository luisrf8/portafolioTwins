import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);

  const navLinks = [
    { href: "/Fabio", label: "Fabio" },
    { href: "/Annarella", label: "Annarella" },
  ];

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          key="header"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="py-6 bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-md"
        >
          <nav className="container mx-auto px-4 md:px-6 flex justify-between space-x-8">
      <button 
      onClick={() => (window.location.href = "/Annarella")}
      className="bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white text-lg font-semibold py-3 px-6 rounded-[2rem] shadow-[0_4px_0_#9d174d] active:shadow-[0_1px_0_#9d174d] transition-all duration-150 ease-in-out relative before:absolute before:inset-0 before:rounded-[2rem] before:shadow-inner before:shadow-white/30 active:translate-y-[2px]">
        ANNARELLA LANZA K
      </button>
      {/* Botones */}
      <button 
      onClick={() => (window.location.href = "/Fabio")}
      className="bg-blue-500 hover:bg-blue-500 active:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-[2rem] shadow-[0_4px_0_#1e3a8a] active:shadow-[0_1px_0_#1e3a8a] transition-all duration-150 ease-in-out relative before:absolute before:inset-0 before:rounded-[2rem] before:shadow-inner before:shadow-white/30 active:translate-y-[2px]">
        FABIO LANZA K
      </button>
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
