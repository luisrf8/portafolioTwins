// animations.js
export const sectionVariants = {
  hidden: { opacity: 0, y: 100, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { opacity: 0, y: -100, scale: 0.95, transition: { duration: 0.6 } }
};
