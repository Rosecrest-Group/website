"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import { Reveal, Stagger } from "@/components/common/Reveal";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  questions: FAQItem[];
  subtitle?: string;
}

const FAQ = ({ questions, subtitle }: FAQProps) => {
  const [activeValue, setActiveValue] = useState("");

  return (
    <div className="py-16 lg:py-20 bg-[#FBF7F4]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Header */}
        <Reveal animation="fade-up" duration={600}>
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] mb-4">
              Frequently asked questions
            </h2>
            {subtitle && (
              <p className={`text-[#4A5565] text-base lg:text-lg max-w-4xl mx-auto ${sourceSans.className}`}>
                {subtitle}
              </p>
            )}
          </div>
        </Reveal>

        {/* Accordion — each item staggers in */}
        <div className="max-w-7xl mx-auto">
          <Accordion
            type="single"
            collapsible
            value={activeValue}
            onValueChange={setActiveValue}
          >
            <Stagger
              animation="fade-up"
              staggerMs={100}
              duration={500}
              className="space-y-4"
            >
              {questions.map((question, index) => {
                const itemValue = `item-${index + 1}`;
                const isActive = activeValue === itemValue;

                return (
                  <AccordionItem
                    key={index}
                    value={itemValue}
                    className={`bg-white rounded-2xl px-6 lg:px-8 transition-all ${
                      isActive ? "shadow-sm" : ""
                    } ${sourceSans.className}`}
                  >
                    <AccordionTrigger
                      className="hover:no-underline py-6 lg:py-8"
                      onClick={() => setActiveValue(isActive ? "" : itemValue)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-left text-base lg:text-lg font-semibold text-[#101828] pr-4">
                          {question.question}
                        </span>
                        <div className="h-10 w-10 rounded-full bg-[#FBF7F4] grid place-items-center shrink-0">
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                              isActive ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent
                      forceMount
                      className={`text-gray-600 text-sm lg:text-base pb-6 lg:pb-8 pt-2 ${
                        isActive ? "" : "hidden"
                      }`}
                    >
                      {question.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Stagger>
          </Accordion>
        </div>

      </div>
    </div>
  );
};

export default FAQ;