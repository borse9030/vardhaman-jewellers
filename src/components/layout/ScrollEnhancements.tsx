'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollEnhancements() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleScroll = useCallback(() => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
    }
    setShowScrollTop(window.scrollY > 280);
  }, []);

  useEffect(() => {
    setMounted(true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Smooth anchor navigation for all in-page hash links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!mounted) return null;

  // Circle progress calculation (circumference = 2 * PI * r)
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      {/* 1. Ultra-Luxury Gold Reading Progress Bar at the Top */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none bg-transparent"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-[#581825] via-[#C5A880] to-[#E5D2B8] shadow-[0_0_8px_rgba(197,168,128,0.6)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Floating Luxury Scroll to Top Button with Circular Progress Ring */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-28 sm:bottom-24 right-4 sm:right-6 z-30 select-none"
          >
            <button
              onClick={scrollToTop}
              className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-[#E8E2D8] hover:border-[#C5A880] flex items-center justify-center text-[#581825] hover:text-[#380B12] transition-all duration-300 hover:shadow-2xl hover:scale-105"
              title="Scroll to top"
              aria-label="Scroll back to top"
            >
              {/* SVG Circular Progress Ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1"
                viewBox="0 0 40 40"
              >
                {/* Track */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-[#E8E2D8]/50"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                {/* Progress */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-[#C5A880] transition-all duration-100 ease-out"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Icon */}
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#581825] group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
