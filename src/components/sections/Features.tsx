import { motion } from "framer-motion";
import {
  Languages,
  Sparkles,
  ShieldCheck,
  Rocket,
  Type,
  BookOpenCheck,
} from "lucide-react";

const items = [
  {
    icon: Languages,
    title: "Bilingual fluency",
    desc: "Chat in Syriac (rtl) or English. Mix languages naturally.",
  },
  {
    icon: Type,
    title: "Orthography aware",
    desc: "Designed for scripts & diacritics. Clean normalization pipeline.",
  },
  {
    icon: BookOpenCheck,
    title: "Traditions & texts",
    desc: "Tuned on curated historical & liturgical corpora†.",
  },
  {
    icon: Sparkles,
    title: "Instruction tuned",
    desc: "Useful, concise responses with modern chat UX.",
  },
  {
    icon: ShieldCheck,
    title: "Safety guardrails",
    desc: "Prompt shielding, content filters, and feedback tools.",
  },
  {
    icon: Rocket,
    title: "Developer-friendly",
    desc: "Firebase auth, Redux state, React components out of the box.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="bg-third dark:bg-background-dark py-20 border-y border-secondary/40 dark:border-background"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-outfit font-semibold">
            Why AramAI?
          </h2>
          <p className="opacity-80 mt-2">
            Purpose-built for Syriac & Aramaic research, learning, and dialog.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.05, duration: 0.55 }}
              className="rounded-2xl p-5 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-third dark:bg-background">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit text-xl font-semibold">{title}</h3>
                  <p className="opacity-80 mt-1">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs opacity-60 mt-4">
          † Replace with your exact datasets / sources when ready.
        </p>
      </div>
    </section>
  );
};

export default Features;
