import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Section from '@/components/layout/Section';
import { db } from '../../../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { sectionVariants } from '../animations';
import { useLocation } from 'react-router-dom';

// import { portfolioData } from '@/data/portfolioData';
import BackgroundScene from './BackgroundScene';
const Hero = (data) => {
  const [datafire, setDatafire] = useState({});
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().replace(/\/+$/, '');
  const isAnnaPath = currentPath === '/anna' || currentPath === '/annarella';
  const isFabioPath = currentPath === '/fabio';
  const portfolioData = data?.data || {};
  const contact = portfolioData.contact || {};
  const displayName = portfolioData.name || 'Twins Lanza K';
  const displayTitle = portfolioData.title || 'Creadores de contenido';
  const heroImageSrc =
    isAnnaPath
      ? "/img/annarella.png"
      : isFabioPath
      ? "/img/fabio.png"
      : "/img/twins/tw.png";
  return (
    <div
      id="hero"
      className="relative isolate overflow-hidden text-center min-h-[100svh] bg-cover bg-[center_24%] md:bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/bg1.jpg')" }}
    >
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative z-[1] flex flex-col justify-center items-center min-h-[100svh] px-4 pt-20 pb-52 md:pb-8"
      >
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-4 md:gap-x-6 md:gap-y-4 text-sm md:text-lg">
          Creadores de contenido Digital
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold break-words">
          <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-lg sm:text-2xl md:text-3xl text-primary/80 mb-6 md:mb-8">
          {displayTitle}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-x-4 md:gap-x-6 text-sm md:text-lg mb-8">
          {contact.phone && (
            <a href={"tel:" + contact.phone} className="flex items-center break-all hover:text-primary transition-colors">
              <Phone size={18} className="mr-2 text-primary/70" /> {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={"mailto:" + contact.email} className="flex items-center break-all hover:text-primary transition-colors">
              <Mail size={18} className="mr-2 text-primary/70" /> {contact.email}
            </a>
          )}
          {contact.website && (
            <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center break-all hover:text-primary transition-colors">
              <Globe size={18} className="mr-2 text-primary/70" /> {contact.website.replace('https://www.','')}
            </a>
          )}
          {contact.location && (
            <span className="flex items-center text-center">
              <MapPin size={18} className="mr-2 text-primary/70" /> {contact.location}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-2xl justify-center">
          {/* Si la ruta es /annarella, no mostrar botón Annarella, mostrar Twins */}
          {!isAnnaPath && (
            <button
              // onClick={() => (window.location.href = "/annarella")}
              className="w-full sm:w-auto bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white text-sm sm:text-base lg:text-lg font-semibold py-3 px-4 sm:px-6 rounded-[2rem] shadow-[0_4px_0_#9d174d] active:shadow-[0_1px_0_#9d174d] transition-all duration-150 ease-in-out relative before:absolute before:inset-0 before:rounded-[2rem] before:shadow-inner before:shadow-white/30 active:translate-y-[2px]"
            >
              ANNARELLA LANZA K
            </button>
          )}

          {/* Si la ruta es /fabio, no mostrar botón Fabio, mostrar Twins */}
          {!isFabioPath && (
            <button
              // onClick={() => (window.location.href = "/fabio")}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-500 active:bg-blue-700 text-white text-sm sm:text-base lg:text-lg font-semibold py-3 px-4 sm:px-6 rounded-[2rem] shadow-[0_4px_0_#1e3a8a] active:shadow-[0_1px_0_#1e3a8a] transition-all duration-150 ease-in-out relative before:absolute before:inset-0 before:rounded-[2rem] before:shadow-inner before:shadow-white/30 active:translate-y-[2px]"
            >
              FABIO LANZA K
            </button>
          )}

          {/* Si estamos en /annarella o /fabio, mostrar botón TWINS */}
          {(isAnnaPath || isFabioPath) && (
            <button
              // onClick={() => (window.location.href = "/")}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm sm:text-base lg:text-lg font-semibold py-3 px-4 sm:px-6 rounded-[2rem] shadow-[0_4px_0_#166534] active:shadow-[0_1px_0_#166534] transition-all duration-150 ease-in-out relative before:absolute before:inset-0 before:rounded-[2rem] before:shadow-inner before:shadow-white/30 active:translate-y-[2px]"
            >
              TWINS LANZA K
            </button>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center md:hidden pointer-events-none">
          <img
            src={heroImageSrc}
            alt={displayName}
            className="w-[120%] max-w-md sm:max-w-lg object-contain translate-y-0 animate-bounce-slow ml-[20%] md:ml-[30%] lg:ml-[40%]"
          />
        </div>


      </motion.div>

      <div className="absolute bottom-0 w-full justify-center hidden md:flex">
        <img
          src={heroImageSrc}
          alt={displayName}
          className="max-w-[700px] w-full lg:ml-[220px] xl:ml-[300px]"
        />
      </div>
    </div>

  );
};

export default Hero;