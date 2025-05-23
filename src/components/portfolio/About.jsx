import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Section from '@/components/layout/Section';
import { portfolioData } from '@/data/portfolioData';

const About = () => {
  return (
    <Section id="about">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">Sobre Mí</h2>
      <Card className="bg-card/70 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <CardContent className="pt-6">
          <p className="text-md md:text-lg leading-relaxed text-foreground/90">{portfolioData.personalInfo}</p>
        </CardContent>
      </Card>
    </Section>
  );
};

export default About;