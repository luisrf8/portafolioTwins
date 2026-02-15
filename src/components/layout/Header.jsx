import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Image as ImageIcon, Star, Users, Mail, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const handleScroll = () => {
    setIsVisible(window.scrollY > 100);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#hero", label: "Inicio", icon: <Home size={18} /> },
    { href: "#gallery", label: "Galería", icon: <ImageIcon size={18} /> },
    { href: "#skills", label: "Especialidades", icon: <Star size={18} /> },
    { href: "#projects", label: "Colaboraciones", icon: <Users size={18} /> },
    { href: "#booking", label: "Contacto", icon: <Mail size={18} /> },
    { href: "/fabio", label: "Fabio" },
    { href: "/annarella", label: "Annarella" },
  ];

  const handleNavLinkClick = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (location.pathname !== "/") {
      navigate(`/${href}`);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
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
          className="py-3 bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-md"
        >
          <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Fabio & Annarella</p>
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => handleNavLinkClick(link.href)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all hover:bg-gray-100 text-gray-700 whitespace-nowrap"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-gray-200"
              >
                <div className="container mx-auto px-4 py-3 grid grid-cols-1 gap-2">
                  {navLinks.map((link) => (
                    <button
                      type="button"
                      key={link.href}
                      onClick={() => handleNavLinkClick(link.href)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-gray-100 text-gray-700"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
