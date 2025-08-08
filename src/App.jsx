// App.jsx
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPortfolio from './pages/DynamicPortofolio';
import HomePage from '@/pages/HomePage';
import { useTheme } from '@/contexts/ThemeContext';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen text-foreground gradient-bg`}>
      <Header />
      <main className="">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:personName" element={<DynamicPortfolio />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
