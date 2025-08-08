import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Section from '@/components/layout/Section';
import { db } from '../../../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

// import { portfolioData } from '@/data/portfolioData';
import BackgroundScene from './BackgroundScene';
const Hero = (data) => {
  const [datafire, setDatafire] = useState({});
  const portfolioData = data?.data
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "twinslanza"));
      const result = {};
      querySnapshot.forEach((doc) => {
        result[doc.id] = doc.data();
      });
      console.log("dasdsa", result)
      setDatafire(result);
    };
    fetchData();
  }, []);
  return (
      <div
  id="hero"
  className="relative text-center h-[100vh] bg-[url('/img/bg.png')] bg-cover bg-center"
>
  <motion.div 
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    className="relative z-[1] flex flex-col justify-center items-center h-full"
  >
    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-4 md:gap-x-6 md:gap-y-4 text-md md:text-lg">
Creadores de contenido Digital
    </div>
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold">
      <span className="gradient-text">{portfolioData.name}</span>
    </h1>


    <p className="text-xl sm:text-2xl md:text-3xl text-primary/80 md:mb-8">
      {portfolioData.title}
    </p>

    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-4 md:gap-x-6 text-md md:text-lg mb-8">
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
        <div className="flex gap-4">
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
    </div>

  </motion.div>

<div className="absolute bottom-0 w-full flex justify-center">
  <img
    src="/img/tw.png"
    alt={portfolioData.name}
    className="max-w-[700px] w-full ml-[300px]"
  />
</div>
</div>

  );
};

export default Hero;