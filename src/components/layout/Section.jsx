import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Section = ({ children, className, id }) => (
  <motion.section
    id={id}
    className={cn("py-12 md:py-20", className)}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6 }}
  >
    <div className="container mx-auto px-4 md:px-6">{children}</div>
  </motion.section>
);

export default Section;