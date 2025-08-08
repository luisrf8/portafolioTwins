// pages/HomePage.jsx
import React from 'react';
import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import Projects from '@/components/portfolio/Projects';
import Experience from '@/components/portfolio/Experience';
import Education from '@/components/portfolio/Education';
import Booking from '@/components/portfolio/Booking';
import { portfolioData } from '@/data/portfolioData';

const HomePage = () => {
  return (
    <>
      <Hero data={portfolioData.twinslanza} />
      <About data={portfolioData.twinslanza} />
      <Skills data={portfolioData.twinslanza} />
      <Projects data={portfolioData.twinslanza} />
      <Experience data={portfolioData.twinslanza} />
      <Education data={portfolioData.twinslanza} />
      <Booking data={portfolioData.twinslanza} />
    </>
  );
};

export default HomePage;
