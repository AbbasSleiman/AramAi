import { Link } from "react-router-dom";
import Logo from "../../components/atoms/Logo";
import { motion } from "motion/react";
import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 dark:supports-[backdrop-filter]:bg-background-dark/60 bg-background dark:bg-background-dark border-b border-secondary/40 dark:border-background">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-outfit font-semibold">AramAI</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <a href="#features">Features</a>
          <a href="#examples">Examples</a>
          <a href="#how">How it works</a>
          <a href="#model">Model</a>
          <a href="#faq">FAQ</a>
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
            <ChangeThemeBtn />
          </motion.div>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
