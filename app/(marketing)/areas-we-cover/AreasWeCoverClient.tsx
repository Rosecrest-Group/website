"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEnquiryStore } from "@/store/enquiry-store";
import { sourceSans } from "@/lib/fonts";

// ─── All 33 London boroughs ───────────────────────────────────────────────────
const londonBoroughs = [
  "Barking and Dagenham", "Barnet", "Bexley", "Brent", "Bromley",
  "Camden", "City of London", "Croydon", "Ealing", "Enfield",
  "Greenwich", "Hackney", "Hammersmith and Fulham", "Haringey", "Harrow",
  "Havering", "Hillingdon", "Hounslow", "Islington", "Kensington and Chelsea",
  "Kingston upon Thames", "Lambeth", "Lewisham", "Merton", "Newham",
  "Redbridge", "Richmond upon Thames", "Southwark", "Sutton", "Tower Hamlets",
  "Waltham Forest", "Wandsworth", "Westminster",
];

const londonNeighbourhoods = [
  "Brixton", "Peckham", "Dalston", "Shoreditch", "Canary Wharf", "Stratford",
  "Notting Hill", "Shepherd's Bush", "Clapham", "Balham", "Tooting",
  "Streatham", "Croydon", "Lewisham", "Deptford", "New Cross", "Catford",
  "Forest Hill", "Sydenham", "Bethnal Green", "Bow", "Mile End", "Poplar",
  "Stepney", "Whitechapel", "Wapping", "Bermondsey", "Borough", "Elephant",
  "Kennington", "Vauxhall", "Stockwell", "Herne Hill", "Tulse Hill",
  "Norwood", "Thornton Heath", "Selhurst", "Wimbledon", "Raynes Park",
  "Morden", "Mitcham", "Colliers Wood", "Tooting Bec", "Battersea", "Chelsea",
  "Fulham", "Parsons Green", "Putney", "Wandsworth", "Earlsfield", "Sutton",
  "Cheam", "Belmont", "Carshalton", "Wallington", "Hackbridge", "Beddington",
  "Coulsdon", "Purley", "Crystal Palace", "Anerley", "Penge", "Beckenham",
  "Bromley", "Orpington", "Sidcup", "Bexley", "Welling", "Erith",
  "Woolwich", "Plumstead", "Abbey Wood", "Thamesmead", "Charlton",
  "Greenwich", "Blackheath", "Acton", "Chiswick", "Brentford", "Kew",
  "Richmond", "Twickenham", "Teddington", "Hampton", "Feltham", "Hounslow",
  "Southall", "Greenford", "Wembley", "Harlesden", "Willesden", "Hendon",
  "Finchley", "Mill Hill", "Edgware", "Stanmore", "Harrow", "Pinner",
  "Ruislip", "Uxbridge", "Southgate", "Enfield", "Edmonton", "Tottenham",
  "Wood Green", "Crouch End", "Finsbury Park", "Stoke Newington", "Clapton",
  "Leyton", "Walthamstow", "Ilford", "Romford", "Dagenham", "Barking",
  "East Ham", "West Ham", "Camden Town", "Kentish Town", "Archway", "Highgate",
  "Hampstead", "Paddington", "Bayswater", "Marylebone", "Fitzrovia",
  "Bloomsbury", "Holborn", "Covent Garden", "Soho", "Mayfair", "Belgravia",
  "Pimlico", "Victoria", "Waterloo", "Southbank",
];

const londonPostcodeDistricts = [
  "E1","E2","E3","E4","E5","E6","E7","E8","E9","E10","E11","E12","E13",
  "E14","E15","E16","E17","E18","EC1","EC2","EC3","EC4",
  "N1","N2","N3","N4","N5","N6","N7","N8","N9","N10","N11","N12",
  "N13","N14","N15","N16","N17","N18","N19","N20","N21","N22",
  "NW1","NW2","NW3","NW4","NW5","NW6","NW7","NW8","NW9","NW10","NW11",
  "SE1","SE2","SE3","SE4","SE5","SE6","SE7","SE8","SE9","SE10","SE11",
  "SE12","SE13","SE14","SE15","SE16","SE17","SE18","SE19","SE20","SE21",
  "SE22","SE23","SE24","SE25","SE26","SE27","SE28",
  "SW1","SW2","SW3","SW4","SW5","SW6","SW7","SW8","SW9","SW10","SW11",
  "SW12","SW13","SW14","SW15","SW16","SW17","SW18","SW19","SW20",
  "W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12","W13","W14",
  "WC1","WC2",
  "BR1","BR2","BR3","BR4","BR5","BR6","BR7","BR8",
  "CR0","CR2","CR3","CR4","CR5","CR6","CR7","CR8","CR9",
  "DA1","DA2","DA3","DA4","DA5","DA6","DA7","DA8","DA9","DA10",
  "EN1","EN2","EN3","EN4","EN5","EN6","EN7","EN8","EN9",
  "HA0","HA1","HA2","HA3","HA4","HA5","HA6","HA7","HA8","HA9",
  "IG1","IG2","IG3","IG4","IG5","IG6","IG7","IG8","IG9","IG10","IG11",
  "KT1","KT2","KT3","KT4","KT5","KT6","KT7","KT8","KT9",
  "RM1","RM2","RM3","RM4","RM5","RM6","RM7","RM8","RM9","RM10",
  "RM11","RM12","RM13","RM14","RM15","RM16","RM17","RM18","RM19","RM20",
  "SM1","SM2","SM3","SM4","SM5","SM6","SM7",
  "TW1","TW2","TW3","TW4","TW5","TW6","TW7","TW8","TW9","TW10",
  "TW11","TW12","TW13","TW14","TW15","TW16","TW17","TW18","TW19","TW20",
  "UB1","UB2","UB3","UB4","UB5","UB6","UB7","UB8","UB9","UB10","UB11",
  "WD1","WD2","WD3","WD4","WD5","WD6","WD7","WD17","WD18","WD19","WD23","WD24","WD25",
];

const london = {
  name: "London",
  tagline: "All 33 boroughs covered",
  description: "Full coverage across all 33 London boroughs, including the City of London.",
  boroughs: londonBoroughs,
  neighbourhoods: londonNeighbourhoods,
  postcodes: londonPostcodeDistricts,
};

const m25Areas = [
  {
    id: "surrey",
    name: "Surrey",
    description: "Large parts fall within the M25, including Kingston, Epsom, Reigate and Weybridge.",
    towns: ["Weybridge","Walton-on-Thames","Esher","Cobham","Leatherhead","Epsom","Ewell","Banstead","Reigate","Redhill","Guildford","Woking","Staines-upon-Thames","Egham","Virginia Water"],
    postcodes: ["KT10","KT11","KT12","KT13","KT17","KT18","KT19","KT20","KT22","RH1","RH2","GU1","GU2","GU21","GU22","TW18","TW19","TW20"],
  },
  {
    id: "kent",
    name: "Kent",
    description: "North West Kent areas within or just inside the M25, including Bromley, Dartford and Sevenoaks.",
    towns: ["Bromley","Orpington","Sidcup","Swanley","Dartford","Crayford","Longfield","Sevenoaks","Otford","Kemsing"],
    postcodes: ["BR1","BR2","BR3","BR4","BR5","BR6","BR7","BR8","DA1","DA2","DA3","DA4","TN13","TN14","TN15"],
  },
  {
    id: "hertfordshire",
    name: "Hertfordshire",
    description: "Southern areas within or directly on the M25, including Watford, St Albans and Potters Bar.",
    towns: ["Watford","Bushey","Radlett","Borehamwood","Potters Bar","Waltham Cross","Cheshunt","Broxbourne","Hoddesdon","St Albans","Hatfield","Welwyn Garden City"],
    postcodes: ["WD17","WD18","WD19","WD23","WD24","WD25","EN6","EN7","EN8","EN9","AL1","AL2","AL9","AL10"],
  },
  {
    id: "essex",
    name: "Essex",
    description: "Selected areas close to the M25 boundary, including Epping, Loughton and Brentwood.",
    towns: ["Loughton","Chigwell","Buckhurst Hill","Waltham Abbey","Epping","North Weald","Harlow","Brentwood","Billericay","Basildon"],
    postcodes: ["IG7","IG9","IG10","EN9","CM16","CM17","CM18","CM19","CM20","CM15","CM12","CM11"],
  },
];

// ─── Postcode extraction ──────────────────────────────────────────────────────
// UK postcodes: AN, ANN, AAN, AANN, ANA, AANA
// Outward code is the part before the space. District is letters + first digits only.
// W1K 3JP → outward = W1K → district = W1 (strip trailing letter from sector-style codes)
// SW9 8LB → outward = SW9 → district = SW9
// KT10 4AB → outward = KT10 → district = KT10
// EN1 3XY → outward = EN1 → district = EN1

function extractDistrict(input: string): string {
  // Remove all spaces, uppercase
  const clean = input.replace(/\s+/g, "").toUpperCase();

  // Full postcode is typically 6-7 chars: outward (2-4) + inward (3)
  // If length suggests a full postcode, take everything except the last 3 chars (inward)
  if (clean.length >= 5) {
    const outward = clean.slice(0, clean.length - 3);
    // Strip any trailing letter from the outward (e.g. W1K → W1, EC1A → EC1)
    const district = outward.replace(/[A-Z]$/, "");
    return district;
  }

  // Short input — treat as district directly, strip trailing letter
  return clean.replace(/[A-Z]$/, "");
}

type CoverageResult = "covered" | "edge" | "outside" | null;

function checkCoverage(input: string): { result: CoverageResult; area?: string } {
  const raw = input.trim();
  if (!raw) return { result: null };

  const district = extractDistrict(raw);
  const q = district.toLowerCase();

  // Also try the raw outward (first word) for cases like "SW9" typed without full postcode
  const rawOutward = raw.replace(/\s+/g, "").toUpperCase().slice(0, raw.trim().split(/\s+/)[0].length);
  const rawOutwardStripped = rawOutward.replace(/[A-Z]$/, "").toLowerCase();

  const candidates = [...new Set([q, rawOutwardStripped, raw.trim().toLowerCase()])];

  // London postcode match — check all candidates
  for (const candidate of candidates) {
    if (london.postcodes.some((p) => p.toLowerCase() === candidate)) {
      return { result: "covered", area: "London" };
    }
  }

  // London borough / neighbourhood text match (3+ chars only)
  if (raw.length >= 3 && !raw.match(/^[A-Z]{1,2}\d/i)) {
    const text = raw.toLowerCase();
    if (
      london.boroughs.some((b) => b.toLowerCase().includes(text)) ||
      london.neighbourhoods.some((n) => n.toLowerCase().startsWith(text))
    ) {
      return { result: "covered", area: "London" };
    }
  }

  // M25 areas
  for (const area of m25Areas) {
    for (const candidate of candidates) {
      if (area.postcodes.some((p) => p.toLowerCase() === candidate)) {
        return { result: "edge", area: area.name };
      }
    }
    // Town/name text match
    if (raw.length >= 3 && !raw.match(/^[A-Z]{1,2}\d/i)) {
      const text = raw.toLowerCase();
      if (
        area.towns.some((t) => t.toLowerCase().includes(text)) ||
        area.name.toLowerCase().includes(text)
      ) {
        return { result: "edge", area: area.name };
      }
    }
  }

  return { result: "outside" };
}

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
