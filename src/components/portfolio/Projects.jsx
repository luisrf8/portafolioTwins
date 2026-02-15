import React from "react";
import { motion } from "framer-motion";
import Section from "@/components/layout/Section";

const Projects = ({ data }) => {
  const portfolioData = data;
  const collaborations = Array.isArray(portfolioData?.experience) ? portfolioData.experience : [];

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <Section id="projects" className="bg-muted/40">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">
        Colaboraciones
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 justify-items-center">
        {collaborations.map((imgUrl, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg hover:scale-105 transition-transform bg-white flex items-center justify-center p-2"
          >
            <img
              src={imgUrl}
              alt={`Colaboración ${index + 1}`}
              className="object-contain w-full h-full"
            />
          </motion.div>
        ))}
        {collaborations.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">No hay colaboraciones disponibles todavía.</p>
        )}
      </div>
    </Section>
  );
};

export default Projects;
            