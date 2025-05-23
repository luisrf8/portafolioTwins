import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Section from '@/components/layout/Section';
import { useToast } from '@/components/ui/use-toast';

const Booking = () => {
  const [date, setDate] = useState(undefined);
  const [time, setTime] = useState('');
  const { toast } = useToast();

  const handleBooking = (e) => {
    e.preventDefault();
    if (!date || !time) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una fecha y hora.",
        variant: "destructive",
      });
      return;
    }

    const bookingDetails = {
      date: format(date, "PPP", { locale: es }),
      time: time,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('meetingBooking', JSON.stringify(bookingDetails));

    // Generar el mensaje de WhatsApp
    const whatsappMessage = `Hola! Vengo de tu portafolio, me gustaría agendar una reunión para el ${bookingDetails.date} a las ${bookingDetails.time}.`;
    const whatsappLink = `https://wa.me/584148859372?text=${encodeURIComponent(whatsappMessage)}`;

    // Abrir el enlace de WhatsApp
    window.open(whatsappLink, '_blank');

    toast({
      title: "¡Reunión Agendada!",
      description: `Has agendado una reunión para el ${bookingDetails.date} a las ${bookingDetails.time}.`,
    });
    setDate(undefined);
    setTime('');
  };

  return (
    <Section id="booking" className="bg-background">
      <h2 className="text-3xl md:text-4xl font-bold mb-5 md:mb-0 text-center gradient-text">Agendar Reunión</h2>
      <div className="flex justify-between items-center gap-4 w-[90vw] md:w-[80vw] lg:w-[70vw] mx-auto">
        <Card className="bg-card/70 w-full h-fit shadow-xl hover:shadow-primary/20 transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Selecciona Fecha y Hora</CardTitle>
            <CardDescription>Elige un día y hora convenientes para nuestra reunión.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date-picker">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-picker"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={es}
                      disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() -1 )) } 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-picker">Hora</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time-picker"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Agendar Reunión
              </Button>
            </form>
          </CardContent>
        </Card>

<img
  className="w-[30vw] md:w-[20vw] hidden md:block drop-shadow-[0px_0px_2px_white]"
  src="./img/luis3.png"
  alt="luis"
/>
      </div>
    </Section>
  );
};

export default Booking;