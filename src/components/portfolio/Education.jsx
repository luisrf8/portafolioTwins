import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';

const Education = ({ data }) => {
  const portfolioData = data;
  const videoRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {}); // Inicia el video si está visible
          } else {
            video.pause(); // Pausa si no está visible
          }
        });
      },
      { threshold: 0.5 } // 50% visible para considerarlo "en pantalla"
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, []);

  return (
    <Section id="education">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">
        Skills
      </h2>

      {/* Grid de videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {portfolioData.skils.map((videoSrc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-lg "
          >
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              src={videoSrc.img}
              muted
              alt={videoSrc.img}
              playsInline
              loop
              preload="auto"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <div className="p-4">
              <h3 className="text-lg text-center font-semibold mb-2">{videoSrc.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Education;
