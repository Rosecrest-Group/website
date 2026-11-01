import { PHONE, PHONE_HREF } from "@/lib/constants";
import CallbackForm from "@/components/site/CallbackForm";
import { Eyebrow } from "@/components/site/primitives";

/**
 * "Talk to us" call-back block that closes most pages: heading, then the form in a
 * centred card with a phone strip along its bottom. Anchored at #callback so buttons
 * anywhere on the page can jump to it.
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
        <div className="w-full max-w-[760px] rounded-[26px] border border-line bg-white shadow-card">
          <CallbackForm className="p-6 md:p-10" formName={formName} defaultNeeds={defaultNeeds} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-b-[25px] border-t border-teal-line bg-teal-tint px-6 py-4 md:px-10">
            <p className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-[15px] text-body">Rather talk now?</span>
              <a
                href={PHONE_HREF}
                className="font-display text-[22px] font-extrabold text-ink no-underline hover:text-teal"
              >
                {PHONE}
              </a>
            </p>
            <span className="text-[13px] text-body">Mon to Fri, 8am to 5pm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
