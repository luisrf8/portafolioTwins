import React, { useState, useEffect } from 'react';
import { portfolioData } from '@/data/portfolioData';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import { Avatar } from '@/components/ui/avatar';
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { href: "#about", label: "Sobre Mí" },
    { href: "#skills", label: "Habilidades" },
    { href: "#projects", label: "Proyectos" },
    { href: "#experience", label: "Experiencia" },
    { href: "#education", label: "Educación" },
    { href: "#booking", label: "Agendar Reunión" },
  ];

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const handleNavLinkClick = (href) => {
    if (isMobileMenuOpen) {
       toggleMobileMenu();
    }
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80; 
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };


  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="py-6 bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-md"
    >
      <nav className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <a href="#hero" 
           onClick={(e) => {
             e.preventDefault();
             const element = document.querySelector("#hero");
             if (element) {
                // Special case for hero, scroll to top without offset
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             }
           }}
           className="flex gap-2 items-center text-xl md:text-2xl font-bold gradient-text hover:opacity-80 transition-opacity">
          <Avatar className="w-[4rem] bg-white h-[4rem] md:w-[4rem] md:h-[4rem] border-4 border-primary shadow-xl">
            <img  src={portfolioData.img} alt={portfolioData.img_alt} />
            {/* <AvatarFallback>{portfolioData.name.substring(0,2).toUpperCase()}</AvatarFallback> */}
          </Avatar>
          {portfolioData.name}
        </a>
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              onClick={(e) => {
                e.preventDefault();
                handleNavLinkClick(link.href);
              }}
              className="text-foreground/80 hover:text-primary transition-colors">
              {link.label}
            </a>
          ))}
          <ThemeToggleButton />
        </div>
        <div className="md:hidden flex items-center space-x-2">
           <ThemeToggleButton />
          <button onClick={toggleMobileMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={28} className="text-primary" /> : <Menu size={28} className="text-primary" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 shadow-lg absolute w-full left-0"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className="text-foreground/80 hover:text-primary transition-colors text-center py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavLinkClick(link.href);
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;