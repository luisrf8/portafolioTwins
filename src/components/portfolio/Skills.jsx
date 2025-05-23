import React from 'react';
import { motion } from 'framer-motion';
import { Code, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Section from '@/components/layout/Section';
import { portfolioData } from '@/data/portfolioData';
import '../../../public/css/SkillsSlider.css'; // 👈 Importa los estilos

const Skills = () => {
  return (
    <Section id="skills">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">Habilidades</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {portfolioData.skills.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Badge variant="secondary" className="w-full text-center py-2.5 px-3 md:py-3 md:px-4 text-sm md:text-md bg-secondary/80 backdrop-blur-sm border-primary/30 hover:bg-primary/70 hover:text-primary-foreground transition-colors duration-300 shadow-md gap-2">
              <img
                src={`../img/skills/${skill.img}`}
                alt={skill.name}
                className="w-8 h-8 object-contain inline-block"
              />{skill.name}
            </Badge>
          </motion.div>
        ))}
      </div>

      {/* <div className="slider my-10">
        <div className="slide-track grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {portfolioData.skills.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Badge variant="secondary" className="w-full slide text-center py-2.5 px-3 md:py-3 md:px-4 text-sm md:text-md bg-secondary/80 backdrop-blur-sm border-primary/30 hover:bg-primary/70 hover:text-primary-foreground transition-colors duration-300 shadow-md"
            alt={`slide-${index}`}>
              <Code size={16} className="mr-1.5 md:mr-2" /> {skill}
            </Badge>
          </motion.div>
        ))}
        </div>
      </div> */}

      <div className="mt-10 text-center">
        <h3 className="text-2xl font-semibold mb-4 gradient-text">Idiomas</h3>
        <div className='flex flex-wrap justify-center items-center gap-4'>
          {portfolioData.languages.map((lang, index) => (
            <Badge key={index} variant="outline" className="text-md md:text-lg py-2 px-4 border-primary/50 text-primary/90 shadow-md">
              <Award size={18} className="mr-2" /> {lang.lang} <span className="ml-2 text-sm text-foreground/70">({lang.cert})</span>
            </Badge>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Skills;
