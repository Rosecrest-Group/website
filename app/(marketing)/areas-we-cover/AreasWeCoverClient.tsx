"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEnquiryStore } from "@/store/enquiry-store";
import { sourceSans } from "@/lib/fonts";

import { checkCoverage, london, m25Areas, type CoverageResult } from "@/lib/coverage";

const AreasWeCoverClient = () => {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { openEnquiry } = useEnquiryStore();

  const coverage = useMemo(() => {
    if (!submitted || !input.trim()) return { result: null as CoverageResult };
    return checkCoverage(input);
  }, [input, submitted]);

  const handleCheck = () => {
    if (input.trim()) setSubmitted(true);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    setSubmitted(false);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-16 lg:py-24">
      {/* ── Coverage Checker ── */}
      <div className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
          Check if we cover your area
        </h2>
        <p className={`${sourceSans.className} text-[#4A5565] text-base mb-6`}>
          Enter your postcode to confirm coverage and availability.
        </p>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#262A6F]" />
            <Input
              type="text"
              placeholder="Enter your postcode e.g. SW9 8LB"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className={`${sourceSans.className} pl-11 pr-4 h-13 text-base rounded-2xl border-2 border-[#E5E7EB] focus-visible:border-[#262A6F] focus-visible:ring-0 bg-white text-[#101828] placeholder:text-[#9CA3AF]`}
            />
          </div>
          <Button
            onClick={handleCheck}
            disabled={!input.trim()}
            size="lg"
            className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-2xl h-13 px-8 text-sm font-semibold shrink-0 disabled:opacity-40"
          >
            Check Coverage
          </Button>
        </div>

        {/* ── Result States ── */}
        {submitted && coverage.result && (
          <div className="mt-6">
            {/* ✅ Covered */}
            {coverage.result === "covered" && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-green-800 text-base">
                      Great news — we cover your area
                    </p>
                    <p
                      className={`${sourceSans.className} text-green-700 text-sm mt-1`}
                    >
                      We carry out inspections in your area. Request an
                      inspection below and a member of our team will be in touch
                      to confirm availability and pricing.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    openEnquiry("Property inspection — " + coverage.area, input)
                  }
                  size="lg"
                  className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full h-11 px-6 text-sm font-semibold flex items-center gap-2"
                >
                  Request an Inspection
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* ⚠️ Edge — positive wording */}
            {coverage.result === "edge" && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-800 text-base">
                      We are likely to cover your area
                    </p>
                    <p
                      className={`${sourceSans.className} text-blue-700 text-sm mt-1`}
                    >
                      {coverage.area} falls within our extended service area. We
                      regularly carry out inspections in this area — get in
                      touch and we&apos;ll confirm availability for your
                      specific location.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    openEnquiry("Property inspection — " + coverage.area, input)
                  }
                  size="lg"
                  className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full h-11 px-6 text-sm font-semibold flex items-center gap-2"
                >
                  Confirm Availability
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* ❌ Outside */}
            {coverage.result === "outside" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-800 text-base">
                      Outside our standard coverage
                    </p>
                    <p
                      className={`${sourceSans.className} text-amber-700 text-sm mt-1`}
                    >
                      We primarily serve London and the M25 corridor. Your area
                      is outside this range, but please get in touch — depending
                      on the scope of work, we may still be able to assist.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => handleInputChange("")}
                    className="rounded-full h-11 px-6 text-sm border-[#262A6F] text-[#262A6F] hover:bg-[#262A6F]/5"
                  >
                    Try another postcode
                  </Button>
                  <Button
                    onClick={() =>
                      openEnquiry(
                        "Coverage query — outside M25: " + input,
                        input,
                      )
                    }
                    size="lg"
                    className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full h-11 px-6 text-sm font-semibold flex items-center gap-2"
                  >
                    Get in Touch
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Coverage Summary Cards ── */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-[#101828] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#262A6F] inline-block" />
          Our Coverage Areas
        </h3>

        {/* London */}
        <div className="bg-white border border-[#F3F4F6] rounded-2xl p-6 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#262A6F] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h4 className="text-lg font-bold text-[#101828]">London</h4>
              <span
                className={`${sourceSans.className} text-xs font-semibold text-[#262A6F] bg-[#262A6F]/8 px-3 py-1 rounded-full`}
              >
                All 33 boroughs covered
              </span>
            </div>
            <p
              className={`${sourceSans.className} text-sm text-[#4A5565] mb-4`}
            >
              Full coverage across all 33 London boroughs, including the City of
              London.
            </p>
            <div className="flex flex-wrap gap-2">
              {london.boroughs.map((b) => (
                <span
                  key={b}
                  className={`${sourceSans.className} text-xs px-3 py-1 rounded-full bg-[#F3F4F6] text-[#4A5565]`}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* M25 areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {m25Areas.map((area) => (
            <div
              key={area.id}
              className="bg-white border border-[#F3F4F6] rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#262A6F] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#101828] mb-1">
                    {area.name}
                  </h4>
                  <p
                    className={`${sourceSans.className} text-xs text-[#4A5565]`}
                  >
                    {area.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {area.towns.map((town) => (
                  <span
                    key={town}
                    className={`${sourceSans.className} text-xs px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#4A5565]`}
                  >
                    {town}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Outside M25 CTA */}
        <div className="bg-white border border-[#F3F4F6] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FBF7F4] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-[#4A5565]" />
          </div>
          <h3 className="text-xl font-bold text-[#101828] mb-2">
            Not sure if we cover you?
          </h3>
          <p
            className={`${sourceSans.className} text-sm text-[#4A5565] mb-6 max-w-xl mx-auto`}
          >
            If your property is near the M25 boundary or outside our listed
            areas, just get in touch. We regularly take on work in surrounding
            areas and will always do our best to accommodate your requirements.
          </p>
          <Button
            onClick={() => openEnquiry("Coverage query")}
            className="rounded-full px-8 bg-[#262A6F] hover:bg-[#262A6F]/90 text-white inline-flex items-center gap-2"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AreasWeCoverClient;
