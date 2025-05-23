import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Section from '@/components/layout/Section';
import { portfolioData } from '@/data/portfolioData';

const Experience = () => {
  return (
    <Section id="experience">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">Experiencia Laboral</h2>
      <div className="space-y-8 md:space-y-10">
        {portfolioData.experience.map((job, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-card/70 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-secondary/30 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div>
                    <CardTitle className="text-xl md:text-2xl text-primary">{job.title}</CardTitle>
                    <CardDescription className="text-primary/80 text-md md:text-lg">{job.company}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap border-primary/50 text-primary/90 self-start sm:self-center mt-1 sm:mt-0">
                    <Calendar size={12} className="mr-1 sm:mr-1.5" /> {job.period}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/70 flex items-center mt-2"><MapPin size={14} className="mr-1.5" />{job.location}</p>
              </CardHeader>
              <CardContent className="pt-4 p-4 md:p-6">
                <ul className="list-disc list-inside space-y-2 text-foreground/80 text-sm md:text-base">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Experience;