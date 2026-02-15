// App.jsx
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicPortfolio from './pages/DynamicPortofolio';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/AdminPage';
import { useTheme } from '@/contexts/ThemeContext';
import { Routes, Route, useLocation } from 'react-router-dom';

const App = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen text-foreground gradient-bg`}>
      {!isAdminRoute && <Header />}
      <main className="">
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/:personName" element={<HomePage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster />
    </div>
  );
};

export default App;
