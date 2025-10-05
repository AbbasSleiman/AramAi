import { motion } from "framer-motion";
import { MessageCircleQuestion, ScanText, Reply } from "lucide-react";

const steps = [
  {
    icon: MessageCircleQuestion,
    title: "Ask",
    desc: "Type in Syriac or English. Mix languages if you like.",
  },
  {
    icon: ScanText,
    title: "Understand",
    desc: "AramAI normalizes script & diacritics and interprets context.",
  },
  {
    icon: Reply,
    title: "Answer",
    desc: "Concise, sourced responses with right-to-left aware formatting.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how"
      className="py-20 bg-third dark:bg-background-dark border-y border-secondary/40 dark:border-background"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-outfit font-semibold">
            How it works
          </h2>
          <p className="opacity-80 mt-2">From prompt to polished answer.</p>
        </div>

        <ol className="grid md:grid-cols-3 gap-5">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className="rounded-2xl p-6 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-third dark:bg-background">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-outfit text-xl font-semibold">{title}</h3>
              </div>
              <p className="mt-2 opacity-80">{desc}</p>
              <div className="mt-4 text-sm opacity-70">Step {i + 1}</div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
