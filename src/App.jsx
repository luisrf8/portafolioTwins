import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import Experience from '@/components/portfolio/Experience';
import Education from '@/components/portfolio/Education';
import Booking from '@/components/portfolio/Booking';
import Projects from '@/components/portfolio/Projects';
import { useTheme } from '@/contexts/ThemeContext';

const App = () => {
  const { theme } = useTheme(); // theme will be 'light' or 'dark'
  return (
    // The class 'gradient-bg' will now apply the solid background color
    // defined in index.css for the current theme.
    <div className={`min-h-screen text-foreground gradient-bg`}>
      <Header />
      <main className="pt-20 md:pt-24"> {/* Increased padding top for better header spacing */}
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Booking />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;