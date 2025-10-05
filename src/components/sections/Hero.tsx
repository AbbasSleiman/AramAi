import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/atoms/Logo";
import LogoText from "../../components/atoms/LogoText";

const container = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: "easeOut" },
  }),
};

const float = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background dark:bg-background-dark"
    >
      {/* Ambient blobs */}
      <motion.div
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-third dark:bg-background2-dark opacity-60"
        variants={float}
        animate="animate"
      />
      <motion.div
        className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full blur-3xl bg-secondary/70 dark:bg-background opacity-50"
        variants={float}
        animate="animate"
        transition={{ delay: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="flex flex-col items-center gap-5"
        >
          <div className="opacity-90">
            {/* Swap between compact logo & full text mark as you prefer */}
            <div className="hidden sm:block">
              <LogoText />
            </div>
            <div className="sm:hidden">
              <Logo />
            </div>
          </div>

          <motion.h1
            custom={1}
            variants={container}
            className="text-4xl md:text-5xl font-outfit font-bold text-text dark:text-text-dark"
          >
            Ancient Wisdom. Modern Intelligence.
          </motion.h1>

          <motion.p
            custom={2}
            variants={container}
            className="max-w-2xl mx-auto text-text/80 dark:text-text-dark/80"
          >
            <span className="font-semibold">AramAI</span> — an instruction-tuned
            LLM specialized for Syriac & Aramaic. Ask in English or Syriac, get
            fluent, context-aware answers.
          </motion.p>

          <motion.div
            custom={3}
            variants={container}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2"
          >
            <button
              onClick={() => navigate("/chat")}
              className="button-styled w-auto px-6 py-3 rounded-2xl flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Start chatting now
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#features"
              className="thin-button !w-auto rounded-2xl px-4 py-2"
            >
              Learn more
            </a>
          </motion.div>

          {/* Language badges */}
          <motion.div
            custom={4}
            variants={container}
            className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm"
          >
            <span className="px-3 py-1 rounded-full bg-third dark:bg-background2-dark">
              Syriac (rtl) • ܣܘܪܝܝܐ
            </span>
            <span className="px-3 py-1 rounded-full bg-third dark:bg-background2-dark">
              Aramaic focus
            </span>
            <span className="px-3 py-1 rounded-full bg-third dark:bg-background2-dark">
              English
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
