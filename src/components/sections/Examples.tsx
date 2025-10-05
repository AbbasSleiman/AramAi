import { motion } from "framer-motion";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useState } from "react";

type CardProps = {
  heading: string;
  prompt: string;
  rtl?: boolean;
};

const ExampleCard = ({ heading, prompt, rtl }: CardProps) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55 }}
      className="rounded-2xl p-5 bg-background dark:bg-background2-dark border border-secondary/50 dark:border-background "
    >
      <div className="flex items-center justify-between">
        <h4 className="font-outfit text-lg font-semibold">{heading}</h4>
        <button
          onClick={copy}
          className="thin-button !w-auto rounded-xl px-2 py-1"
          title="Copy prompt"
        >
          {copied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
        </button>
      </div>
      <div
        className="mt-2 p-4 rounded-xl bg-third dark:bg-background dark:text-text text-sm "
        style={{ direction: rtl ? "rtl" : "ltr" }}
      >
        {prompt}
      </div>
    </motion.div>
  );
};

const Examples = () => {
  return (
    <section id="examples" className="py-20 bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-outfit font-semibold">
            Try these starters
          </h2>
          <p className="opacity-80 mt-2">
            Click to copy, then{" "}
            <a href="/chat" className="underline">
              paste in chat
            </a>
            .
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ExampleCard
            heading="Translate to Syriac"
            prompt="Translate this to classical Syriac and explain orthography choices: “Peace be with you.”"
          />
          <ExampleCard
            heading="Explain a verse"
            prompt="Give historical background and a plain-language explanation of this verse: ܒܪܫܝܬ ܒܪܐ ܐܠܗܐ..."
            rtl
          />
          <ExampleCard
            heading="Compare dialects"
            prompt="Compare Classical Syriac and Turoyo terms for 'wisdom', including pronunciation and usage notes."
          />
          <ExampleCard
            heading="Study helper"
            prompt="Create a 10-card quiz on Syriac letters (names, sounds, sample words)."
          />
          <ExampleCard
            heading="Romanization"
            prompt="Convert this Syriac sentence to a standard Latin romanization with vowels: ܫܠܡܐ ܥܠܝܟܘܢ"
            rtl
          />
          <ExampleCard
            heading="Linguistic analysis"
            prompt="Identify the root and pattern for each Syriac word in: ܚܘܒܐ ܪܒܐ ܗܘ."
            rtl
          />
        </div>
      </div>
    </section>
  );
};

export default Examples;
