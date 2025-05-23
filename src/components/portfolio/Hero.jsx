import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Section from '@/components/layout/Section';
import { portfolioData } from '@/data/portfolioData';

const Hero = () => {
  return (
    <Section id="hero" className="pt-20 md:pt-28 text-center">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="flex flex-col items-center"
      >
        <Avatar className="w-28 h-28 md:w-32 md:h-32 mb-6 border-4 border-primary shadow-xl">
          <img  src="./img/luis3shifted.png" alt={portfolioData.name} />
          {/* <AvatarFallback>{portfolioData.name.substring(0,2).toUpperCase()}</AvatarFallback> */}
        </Avatar>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 md:mb-4">
          <span className="gradient-text">{portfolioData.name}</span>
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-primary/80 mb-6 md:mb-8">{portfolioData.title}</p>
        
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-4 text-md md:text-lg mb-8">
          <a href={"tel:" + portfolioData.contact.phone} className="flex items-center hover:text-primary transition-colors">
            <Phone size={18} className="mr-2 text-primary/70" /> {portfolioData.contact.phone}
          </a>
          <a href={"mailto:" + portfolioData.contact.email} className="flex items-center hover:text-primary transition-colors">
            <Mail size={18} className="mr-2 text-primary/70" /> {portfolioData.contact.email}
          </a>
          <a href={portfolioData.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
            <Globe size={18} className="mr-2 text-primary/70" /> {portfolioData.contact.website.replace('https://www.','')}
          </a>
          <span className="flex items-center">
            <MapPin size={18} className="mr-2 text-primary/70" /> {portfolioData.contact.location}
          </span>
        </div>
      </motion.div>
    </Section>
  );
};

export default Hero;