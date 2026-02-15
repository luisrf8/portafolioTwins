// pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import Hero from '@/components/portfolio/Hero';
import About from '@/components/portfolio/About';
import Skills from '@/components/portfolio/Skills';
import Projects from '@/components/portfolio/Projects';
import Experience from '@/components/portfolio/Experience';
import Education from '@/components/portfolio/Education';
import Booking from '@/components/portfolio/Booking';
import { collection, getDocs } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import { useParams } from 'react-router-dom';
import Gallery from '@/components/portfolio/Gallery';

const hasPortfolioContent = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  const hasName = typeof payload.name === 'string' && payload.name.trim().length > 0;
  const hasTitle = typeof payload.title === 'string' && payload.title.trim().length > 0;
  const hasPersonalInfo = typeof payload.personalInfo === 'string' && payload.personalInfo.trim().length > 0;
  const hasSkills = Array.isArray(payload.skils) && payload.skils.length > 0;
  const hasGallery = Array.isArray(payload.galery) && payload.galery.length > 0;
  const hasExperience = Array.isArray(payload.experience) && payload.experience.length > 0;

  return hasName || hasTitle || hasPersonalInfo || hasSkills || hasGallery || hasExperience;
};

const HomePage = () => {
  const [datafire, setDatafire] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { personName } = useParams();
  const normalizedPerson = (personName || '').trim().toLowerCase();

  useEffect(() => {
    console.log("Current route person:", normalizedPerson);

    const fetchData = async () => {
      setIsLoading(true);
      const personToDoc = {
        fabio: 'fabio',
        anna: 'anna',
        annarella: 'anna',
      };
      const docName = personToDoc[normalizedPerson] || 'twinslanza';

      try {
        const fetchDoc = async (name) => {
          const docRef = doc(db, 'twinslanza', name);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) return null;
          return docSnap.data();
        };

        let payload = await fetchDoc(docName);

        if (!hasPortfolioContent(payload) && docName !== 'twinslanza') {
          payload = await fetchDoc('twinslanza');
        }

        setDatafire(hasPortfolioContent(payload) ? payload : null);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setDatafire(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [normalizedPerson]);

  if (isLoading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  if (!datafire) {
    return <p className="text-center mt-10">No hay datos disponibles para este perfil.</p>;
  }

  return (
    <>
      <Hero data={datafire} />
      <About data={datafire} />
      <Skills data={datafire} />
      <Projects data={datafire} />
      {/* <Education data={datafire} /> */}
      {/* <Experience data={datafire} /> */}
      <Gallery data={datafire}/>
      <Booking data={datafire} />
    </>
  );
};

export default HomePage;
