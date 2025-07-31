import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '@/data/portfolioData';

const Footer = () => {
  return (
    <motion.footer 
      className="py-6 md:py-8 text-center text-foreground/60 border-t border-border/50 mt-10 md:mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }} 
    >
      <p className="text-sm">&copy; {new Date().getFullYear()} {portfolioData.name}. Todos los derechos reservados.</p>
    </motion.footer>
  );
};

export default Footer;