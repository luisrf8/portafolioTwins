import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Section from '@/components/layout/Section';

const Education = (data) => {
  const portfolioData = data?.data

  return (
    <Section id="education">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">Galeria</h2>
      {portfolioData.education.map((edu, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-card/70 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center mb-1 md:mb-2">
                <BookOpen size={24} className="mr-2 md:mr-3 text-primary" />
                <CardTitle className="text-xl md:text-2xl text-primary">{edu.degree}</CardTitle>
              </div>
              <CardDescription className="text-primary/80 text-md md:text-lg">{edu.institution}</CardDescription>
              <p className="text-sm text-foreground/70 flex items-center mt-1"><MapPin size={14} className="mr-1.5" />{edu.location}</p>
            </CardHeader>
            <CardContent className="pb-4 px-4 md:pb-6 md:px-6">
              <ul className="list-disc list-inside space-y-1 text-foreground/80 text-sm md:text-base">
                {edu.status.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Section>
  );
};

export default Education;