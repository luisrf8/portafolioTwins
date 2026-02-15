import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Section from '@/components/layout/Section';

const About = (data) => {
  const portfolioData = data?.data || {};
  const personalInfo = typeof portfolioData.personalInfo === 'string' ? portfolioData.personalInfo.trim() : '';
  const paragraphs = personalInfo ? personalInfo.split('\n\n') : [];

  return (
    <div
      id="about"
      className="min-h-screen px-4 md:px-5 py-12 md:py-16 flex flex-col justify-center items-center"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center gradient-text">
        Información
      </h2>

      <div className="w-full max-w-6xl grid grid-cols-12 justify-between items-center gap-4 mt-8">
        {/* Columna izquierda - ocupa 8 de 12 columnas */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-card/70 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
            <CardContent className="pt-6">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="font-semibold text-center sm:text-left mb-4 text-lg md:text-lg leading-relaxed text-foreground/90"
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="font-semibold text-center sm:text-left mb-4 text-lg md:text-lg leading-relaxed text-foreground/90">
                  Próximamente más información.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Imagen, ocupa 4 de 12 columnas, oculta en sm- */}
        <div className="hidden lg:flex col-span-12 lg:col-span-4 justify-center items-center h-full">
          <img
            src="/img/twins/seleski.png"
            alt={portfolioData.name || 'Imagen de perfil'}
            className="max-h-full w-full max-w-sm"
          />
        </div>
      </div>

    </div>
  );
};

export default About;
