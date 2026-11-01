import { PHONE, PHONE_HREF } from "@/lib/constants";
import CallbackForm from "@/components/site/CallbackForm";
import { Eyebrow } from "@/components/site/primitives";

const STEPS = [
  { title: "We listen", text: "Tell us what’s happening. It usually takes 5 to 15 minutes." },
  { title: "We name the right service", text: "And the fee and turnaround, before you commit to anything." },
  {
    title: "No obligation",
    text: "If it isn’t something we do, we’ll say so and point you in the right direction.",
  },
];

/**
 * "Talk to us" call-back block that closes most pages. Anchored at #callback
 * so buttons anywhere on the page can jump to it.
 */
export default function CallbackSection({
  eyebrow = "Not sure which option applies to you?",
  title = "Talk to us",
  intro = "Property matters are not always straightforward. If you’re unsure which service is appropriate, or your requirements involve multiple elements, speak to us directly and we’ll advise on the most suitable route.",
  formName,
  defaultNeeds,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  formName?: string;
  defaultNeeds?: string[];
}) {
  return (
    <section id="callback" className="scroll-mt-6 bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 px-gutter py-14 md:py-[72px]">
        <div className="flex max-w-[820px] flex-col items-center gap-3.5 text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-[34px] font-extrabold leading-[1.04] md:text-[52px]">{title}</h2>
          <p className="text-lg text-body">{intro}</p>
        </div>
        {/* No overflow-hidden here: the needs dropdown must be able to hang below the card. */}
        <div className="grid w-full rounded-[26px] border border-line bg-white shadow-card lg:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-t-[25px] bg-teal-tint p-6 md:p-10 lg:rounded-l-[25px] lg:rounded-tr-none">
            <b className="font-display text-[22px] leading-[1.2]">You’ll speak with our trusted advisors</b>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <b className="text-base">{step.title}</b>
                    <span className="text-sm text-body">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-teal-line pt-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-body">Rather talk now?</span>
                <a
                  href={PHONE_HREF}
                  className="font-display text-[26px] font-extrabold text-ink no-underline hover:text-ink"
                >
                  {PHONE}
                </a>
              </div>
              <span className="text-[13px] text-body">Mon to Fri, 8am to 5pm</span>
            </div>
          </div>
          <CallbackForm className="p-6 md:p-10" formName={formName} defaultNeeds={defaultNeeds} />
        </div>
      </div>
    </section>
  );
}
