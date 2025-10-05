import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import SiteHeader from "../components/sections/SiteHeader";
import Hero from "../components/sections/Hero";
import Features from "../components/sections/Features";
import Examples from "../components/sections/Examples";
import HowItWorks from "../components/sections/HowItWorks";
import AboutModel from "../components/sections/AboutModel";
import FAQ from "../components/sections/Faq";
import Footer from "../components/sections/Footer";

const MainPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="scroll-smooth bg-background dark:bg-background-dark text-text dark:text-text-dark">
      {/* Progress bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-background2-dark dark:bg-background z-50 origin-left"
      />

      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <Examples />
        <HowItWorks />
        <AboutModel />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
