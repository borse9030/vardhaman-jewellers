'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Are all gold jewellery pieces 100% BIS Hallmarked?',
    answer:
      'Yes, unconditionally. Every gold piece at Vardhaman Jewellers carries the official Bureau of Indian Standards (BIS) Hallmark stamp with 6-digit HUID code certifying 91.6% (22K) or 75.0% (18K) purity.',
  },
  {
    question: 'How is the final jewellery price calculated?',
    answer:
      'We follow a 100% transparent pricing architecture: Final Price = (Net Gold Weight × Daily Gold Rate) + Making Charges + Wastage + Stone Charges + 3% GST. We display exact itemized weight and charge breakdowns on every product page and invoice.',
  },
  {
    question: 'What is your lifetime exchange and buyback policy?',
    answer:
      'We offer an assured lifetime exchange guarantee across all our stores (Jalgaon, Dhule, Pune, Mumbai). For gold exchange, 100% of the prevailing spot bullion rate is credited against pure net gold weight. Certified diamonds carry up to 90% exchange value.',
  },
  {
    question: 'Can I sell my old gold or scrap jewellery?',
    answer:
      'Yes. You can use our "Sell Your Gold" portal to get an instant indicative valuation. In-store, we verify purity using computerized German Karatmeter spectrometers right in front of you with zero hidden melting deductions.',
  },
  {
    question: 'Is doorstep delivery insured and safe?',
    answer:
      'Yes. Every shipment is delivered in tamper-evident sealed security cases with 100% transit insurance handled by specialized high-value logistics partners.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#9A7B4F]">
            Got Questions?
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1818] mt-2">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2">
            Answers to common queries regarding purity, pricing, hallmark, exchange, and delivery.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 text-xs font-bold text-[#1A1818] hover:text-[#581825]"
                >
                  <span className="text-sm">{f.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#581825]" /> : <ChevronDown className="w-4 h-4 text-[#A8A29E]" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#57534E] leading-relaxed border-t border-[#F0ECE4]">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
