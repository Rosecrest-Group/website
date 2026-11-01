import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";
import EnquiryForm from "@/components/site/contact/EnquiryForm";
import { Breadcrumbs } from "@/components/site/primitives";

export const metadata = getPageMetadata("/request-inspection");

export default function RequestInspectionPage() {
  return (
    <>
      <PageJsonLd path="/request-inspection" />

      <section className="bg-mist text-ink">
        <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-4 md:pb-24">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request an inspection" }]} />
          <div className="mt-10 grid items-start gap-10 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
            <div className="flex flex-col gap-4">
              <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[52px]">Request an inspection</h1>
              <p className="text-xl text-body">
                Not sure which service you need? Provide a few details and our team will guide you on the most
                appropriate next step.
              </p>
            </div>
            <EnquiryForm
              title="Fill in the form below"
              intro="Tell us a little about your situation and we’ll direct your enquiry to the appropriate team member."
              submitLabel="Submit"
              formName="Request an inspection form"
            />
          </div>
        </div>
      </section>
    </>
  );
}
