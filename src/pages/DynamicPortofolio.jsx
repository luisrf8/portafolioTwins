// pages/DynamicPortfolio.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { portfolioData } from '@/data/portfolioData';
import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import Projects from '@/components/portfolio/Projects';
import Experience from '@/components/portfolio/Experience';
import Education from '@/components/portfolio/Education';
import Booking from '@/components/portfolio/Booking';

const DynamicPortfolio = () => {
  const { personName } = useParams();
  const personData = portfolioData[personName];
  if (!personData) {
    return <div className="text-center mt-10 text-red-600">404.</div>;
  }

  return (
    <>
      <Hero data={personData} />
      <About data={personData} />
      <Skills data={personData} />
      <Projects data={personData} />
      <Experience data={personData} />
      <Education data={personData} />
      <Booking data={personData} />
    </>
  );
};

export default DynamicPortfolio;
