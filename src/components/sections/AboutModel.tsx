import { motion } from "framer-motion";
import { Cpu, Database, Gauge, Sliders } from "lucide-react";

const AboutModel = () => {
  return (
    <section id="model" className="py-20 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
          >
            <h2 className="text-3xl md:text-4xl font-outfit font-semibold">
              About the model
            </h2>
            <p className="mt-3 opacity-80">
              <span className="font-semibold">AramAI</span> is an
              instruction-tuned model with a focus on Syriac & Aramaic. It
              handles right-to-left script, diacritics, and romanization. The
              pipeline includes script normalization and safety filtering.
            </p>
            <ul className="mt-4 space-y-2 text-sm opacity-80 list-disc list-inside">
              <li>Syriac ↔ English translation and explanation</li>
              <li>Lexical analysis (roots, patterns, morphology)</li>
              <li>Romanization and orthography guidance</li>
              <li>Scholarly & learner-friendly answer styles</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="rounded-2xl p-6 bg-third dark:bg-background-dark border border-secondary/40 dark:border-background"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background">
                <Cpu className="w-5 h-5 mb-2" />
                <div className="text-sm opacity-70">Parameters*</div>
                <div className="text-xl font-semibold">—</div>
              </div>
              <div className="rounded-xl p-4 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background">
                <Database className="w-5 h-5 mb-2" />
                <div className="text-sm opacity-70">Tokens trained*</div>
                <div className="text-xl font-semibold">—</div>
              </div>
              <div className="rounded-xl p-4 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background">
                <Gauge className="w-5 h-5 mb-2" />
                <div className="text-sm opacity-70">Context length</div>
                <div className="text-xl font-semibold">—</div>
              </div>
              <div className="rounded-xl p-4 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background">
                <Sliders className="w-5 h-5 mb-2" />
                <div className="text-sm opacity-70">Modes</div>
                <div className="text-xl font-semibold">Chat • Analysis</div>
              </div>
            </div>
            <p className="text-xs opacity-60 mt-3">
              *Replace placeholders with your actual numbers when finalized.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutModel;
