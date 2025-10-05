import { motion } from "framer-motion";

const faqs = [
  {
    q: "Can I use AramAI in English only?",
    a: "Absolutely. The assistant can explain Syriac topics in English and translate in both directions.",
  },
  {
    q: "What can I use AramAI for?",
    a: "Translation, textual explanation, morphology/root analysis, study aides (quizzes, flashcards), and comparative notes across traditions.",
  },
  {
    q: "Can I export my chats?",
    a: "Yes. Use the Export button in a session to download or share your conversation.",
  },
    {
    q: "Does it work offline?",
    a: "No. Model inference runs in the cloud, so an internet connection is required.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-third dark:bg-background-dark">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-outfit font-semibold">
            FAQ
          </h2>
          <p className="opacity-80 mt-2">Short answers to common questions.</p>
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.details
              key={q}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="group rounded-2xl bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background open:shadow-sm"
            >
              <summary className="cursor-pointer px-5 py-4 font-outfit text-lg">
                {q}
              </summary>
              <div className="px-5 pb-5 opacity-80">{a}</div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
