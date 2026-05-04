import Footer from "@/components/common/Footer";
import FAQSection from "@/components/faqs/FAQSection";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/faqs");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Frequently Asked Questions
        </p>
        <p className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-3xl`}>
          Here are answers to the most common questions about our property
          surveys, valuations, and reports.
        </p>
      </JourneyHero>

      <div className="">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 space-y-20">

          <FAQSection
            title="General FAQs"
            questions={[
              {
                question: "Who are Rosecrest Group Ltd?",
                answer:
                  "Rosecrest Group Ltd is a RICS-regulated property services firm delivering professional inspection, surveying, compliance and trade services across London and the M25 corridor. We work with homeowners, landlords, housing associations, local authorities, solicitors and commercial clients.",
              },
              {
                question: "What areas do you cover?",
                answer:
                  "We cover all 33 London boroughs and areas within or close to the M25, including parts of Surrey, Kent, Hertfordshire and Essex. If your property is near or outside the M25 boundary, please contact us to confirm availability.",
              },
              {
                question: "Are you insured and accredited?",
                answer:
                  "Yes. We are regulated by RICS, hold Constructionline Gold accreditation, are SafeContractor approved, and carry comprehensive professional indemnity insurance.",
              },
              {
                question: "How do I book a survey or inspection?",
                answer:
                  "You can book online through our website, call us directly on 020 4576 5317, or submit an enquiry via our contact page. We will confirm availability, scope and pricing before confirming your appointment.",
              },
            ]}
          />

          <FAQSection
            title="RICS Level 2 & 3 Home Surveys"
            questions={[
              {
                question: "What is the difference between a Level 2 and a Level 3 survey?",
                answer:
                  "A Level 2 (HomeBuyer Report) is suitable for conventional properties in good condition. A Level 3 (Building Survey) provides an in-depth analysis suitable for older, extended, or non-standard properties.",
              },
              {
                question: "How long does a survey take?",
                answer:
                  "A Level 2 survey typically takes 2–3 hours on site; a Level 3 can take half a day or more depending on the size and complexity of the property.",
              },
              {
                question: "Will I receive photographs in my report?",
                answer:
                  "Yes. All reports include clear photographs of defects and RICS condition ratings (1–3).",
              },
              {
                question: "Can you survey vacant or tenanted properties?",
                answer:
                  "Yes. We can inspect occupied, vacant, or tenanted homes as long as access is arranged in advance.",
              },
            ]}
          />

          <FAQSection
            title="Damp, Mould & Condensation Services"
            questions={[
              {
                question: "Do you carry out damp and mould testing?",
                answer:
                  "Yes. Our surveyors carry out on-site inspections to identify damp, mould and condensation issues. Where appropriate, we use moisture meters and thermal imaging to assess the extent of the problem and identify contributing factors.",
              },
              {
                question: "What's included in a Damp & Mould Condition Report?",
                answer:
                  "Our report includes an on-site inspection of affected areas, identification of damp and mould conditions, analysis of contributing factors such as ventilation or structural issues, detailed photographic evidence, and clear recommendations for remedial action.",
              },
              {
                question: "Can you carry out remedial works as well as reports?",
                answer:
                  "Yes. In addition to independent inspection and reporting, we offer mould treatment and remediation services. Remedial works are priced separately based on the size of the affected area, and a treatment quote can be provided following the survey.",
              },
            ]}
          />

          <FAQSection
            title="CPR 35 Expert Witness Reports"
            questions={[
              {
                question: "What is a CPR-35 Expert Witness Report?",
                answer:
                  "A CPR-35 Expert Witness Report is a formal document prepared in accordance with Civil Procedure Rules Part 35, which governs expert evidence in civil proceedings. It provides an independent, impartial assessment of a property matter to assist the court in reaching a fair decision.",
              },
              {
                question: "Who do you prepare reports for?",
                answer:
                  "We prepare expert witness reports for solicitors, legal teams, claimants and defendants involved in civil litigation. Our reports cover property disputes including disrepair claims, boundary disputes, defect analysis and valuation disagreements.",
              },
              {
                question: "How long does it take to produce an expert report?",
                answer:
                  "In most cases we aim to deliver a draft report within 10–15 working days of instruction and site inspection. Urgent instructions can be accommodated — please contact us to discuss your deadline.",
              },
            ]}
          />

          <FAQSection
            title="Party Wall & Boundary Services"
            questions={[
              {
                question: "What is the Party Wall etc. Act 1996?",
                answer:
                  "The Party Wall etc. Act 1996 provides a framework for preventing and resolving disputes in relation to party walls, boundary walls and excavations near neighbouring buildings. It requires building owners to notify adjoining owners before carrying out certain types of work.",
              },
              {
                question: "Do you act for both sides?",
                answer:
                  "As an Agreed Surveyor we can act for both the building owner and the adjoining owner, provided both parties consent. Where one party has concerns about impartiality, we will act solely for the appointing party.",
              },
              {
                question: "How long does the Party Wall process take?",
                answer:
                  "In straightforward cases the process can be completed in a few weeks. Where a Party Wall Award is required, it typically takes 6–8 weeks, though this can vary depending on complexity.",
              },
            ]}
          />

          <FAQSection
            title="Energy Performance Certificates (EPCs)"
            questions={[
              {
                question: "How long is an EPC valid for?",
                answer:
                  "An Energy Performance Certificate is valid for 10 years from the date it was issued. After this period, a new assessment must be carried out if you are selling or renting the property.",
              },
              {
                question: "Do landlords need an EPC before letting?",
                answer:
                  "Yes. Landlords are legally required to have a valid EPC with a rating of E or above before letting a property to new tenants. Failure to comply can result in financial penalties.",
              },
              {
                question: "How quickly can I get an EPC?",
                answer:
                  "In most cases we can arrange an assessment within 1–2 working days, with the certificate issued shortly after the visit. Contact us if you need an urgent EPC.",
              },
            ]}
          />

          <FAQSection
            title="Building And Maintenance Services"
            questions={[
              {
                question: "What types of works do you carry out?",
                answer:
                  "Our trade teams carry out plumbing, carpentry, plastering, painting and decorating, tiling, damp and mould remediation, deep cleaning, carpet cleaning, house clearance and general handyman services.",
              },
              {
                question: "Are your operatives qualified?",
                answer:
                  "Yes. All our trade operatives are qualified and experienced in their respective disciplines. Where required, they hold relevant industry certifications and our work is overseen by our management team.",
              },
              {
                question: "Can you handle larger contracts?",
                answer:
                  "Yes. We work with landlords, housing associations, local authorities and managing agents on both individual instructions and larger programmes of work. Please contact us to discuss your requirements.",
              },
            ]}
          />

          <FAQSection
            title="Pricing & Payment"
            questions={[
              {
                question: "How are fees calculated?",
                answer:
                  "Fees vary depending on the type of service, the size and complexity of the property, and the scope of the instruction. Many of our survey services are offered at fixed prices — for example, our Damp & Mould inspection is fixed at £450. For trade works, quotes are provided based on the specific scope required.",
              },
              {
                question: "Do you charge VAT?",
                answer:
                  "Yes, VAT is applicable to our services where required by HMRC regulations. All prices quoted will clearly state whether VAT is included or applicable at the standard rate.",
              },
              {
                question: "What payment methods are accepted?",
                answer:
                  "We accept payment by bank transfer and major debit and credit cards. Payment terms are confirmed at the point of instruction. For ongoing or programme work, staged payment arrangements may be available.",
              },
            ]}
          />

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Page;