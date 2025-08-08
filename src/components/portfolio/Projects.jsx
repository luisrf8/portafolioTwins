import React from 'react';
import { motion } from 'framer-motion';
import Section from '@/components/layout/Section';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight } from 'lucide-react';

const Projects = (data) => {
  const portfolioData = data?.data

  const { toast } = useToast();

  const handleDemoRequest = (projectTitle) => {
    const whatsappMessage = `Hola! vengo del portafolio onLine, estoy interesado en una demo del proyecto "${projectTitle}".`;
    const whatsappLink = `https://wa.me/584148859372?text=${encodeURIComponent(whatsappMessage)}`;

    // Abrir el enlace de WhatsApp
    window.open(whatsappLink, '_blank');

    toast({
      title: "Solicitud de Demo Enviada",
      description: `Tu solicitud para una demo de "${projectTitle}" ha sido enviada. Nos pondremos en contacto pronto.`,
    });

    // Guardar la solicitud en localStorage (opcional)
    const demoRequests = JSON.parse(localStorage.getItem('demoRequests')) || [];
    demoRequests.push({ projectTitle, requestedAt: new Date().toISOString() });
    localStorage.setItem('demoRequests', JSON.stringify(demoRequests));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <Section id="projects" className="bg-muted/40">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-center gradient-text">Especialidades</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolioData.projects.map((project, index) => (
          <motion.div
            key={project.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card className="h-full flex flex-col bg-card/70 shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02]">
              <CardHeader>
                <div className="aspect-video w-full h-full bg-muted rounded-t-lg overflow-hidden mb-4 flex items-center justify-center">
                  <img  
                    className="object-contain h-100 w-full" 
                    alt={`Vista previa de ${project.title}`}
                    src={`../img/projects/${project.img}`} />
                </div>
                <CardTitle className="text-xl lg:text-2xl text-primary">{project.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.stack.map((tech) => (
                    <Badge key={tech.name} variant="secondary" className="text-xs gap-2">
                      <img
                        src={`../img/skills/${tech.img}`}
                        alt={tech.name}
                        className="w-4 h-4 object-contain inline-block"
                      />{tech.name}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{project.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleDemoRequest(project.title)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group"
                >
                  Solicitar Demo
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Projects;