'use client';
import React, { useState } from 'react';

interface FAQItem {
  question?: string;
  q?: string;
  answer?: string;
  a?: string;
}

export default function FAQSection({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {faqs.map((faq, index) => {
        const question = faq.question || faq.q || '';
        const answer = faq.answer || faq.a || '';
        const isOpen = openIndex === index;

        if (!question || !answer) return null;

        return (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-all bg-white">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full text-left px-5 py-4 font-semibold text-gray-950 flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition"
            >
              <span>{question}</span>
              <span className={`transform transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {isOpen && (
              <div className="px-5 py-4 text-gray-700 border-t border-gray-100 prose text-sm max-w-none leading-relaxed">
                {answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}