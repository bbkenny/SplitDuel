"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Split, Landmark, ShieldCheck, Zap } from "lucide-react";

const slides = [
  {
    title: "One Transaction, Multiple Outcomes",
    description: "Send stablecoins once, and Split Duel automatically routes them to multiple destinations based on your rules.",
    icon: <Split className="w-12 h-12 text-green-500" />,
    color: "from-green-500/20 to-transparent",
  },
  {
    title: "Automated Savings & Yield",
    description: "Portion your incoming funds directly into high-yield vaults or separate savings accounts without extra steps.",
    icon: <Landmark className="w-12 h-12 text-blue-500" />,
    color: "from-blue-500/20 to-transparent",
  },
  {
    title: "Rule-Based Precision",
    description: "Set percentage-based rules for recipients. 10000 basis points equals 100% distribution accuracy.",
    icon: <Zap className="w-12 h-12 text-orange-500" />,
    color: "from-orange-500/20 to-transparent",
  },
  {
    title: "Non-Custodial Security",
    description: "Your funds, your rules. All routing is handled by transparent smart contracts with reentrancy protection.",
    icon: <ShieldCheck className="w-12 h-12 text-emerald-500" />,
    color: "from-emerald-500/20 to-transparent",
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("autosplit_tour_seen");
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("autosplit_tour_seen", "true");
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg overflow-hidden bg-zinc-900/90 border border-zinc-800 rounded-[2rem] shadow-2xl"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} transition-colors duration-500`} />

        <div className="relative p-10 flex flex-col items-center text-center">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 p-6 bg-zinc-800/50 rounded-3xl border border-zinc-700/50 backdrop-blur-sm">
                {slides[currentSlide].icon}
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                {slides[currentSlide].title}
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-sm">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between w-full mt-auto pt-6 border-t border-zinc-800/30">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-10 bg-green-500" : "w-2 bg-zinc-800"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all active:scale-95 group shadow-lg shadow-green-900/20"
            >
              {currentSlide === slides.length - 1 ? "Start Routing" : "Next"}
              <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
