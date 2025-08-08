import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Section from '@/components/layout/Section';

const About = (data) => {
  const portfolioData = data?.data;

  return (
    <Section id="about" className="h-[100vh] flex flex-col justify-center items-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">
        Informacion
      </h2>
      <Card className="bg-card/70 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <CardContent className="pt-6">
          {portfolioData.personalInfo
            .split('\n\n')
            .map((paragraph, index) => (
              <p
                key={index}
                className="font-semibold text-center mb-4 text-lg md:text-lg leading-relaxed text-foreground/90"
              >
                {paragraph}
              </p>
            ))}
        </CardContent>
      </Card>
    </Section>
  );
};

export default About;
