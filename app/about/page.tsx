import Footer from "@/components/common/Footer";
import AboutDescription from "@/fragments/about/AboutDesc";
import ClientTestimonials from "@/fragments/about/ClientTestimonials";
import WhyChooseRosecrest from "@/fragments/about/WhyRosecrest";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          About Rosecrest Group Ltd.
        </p>
        <p
          className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-3xl`}
        >
          At Rosecrest Group Ltd, we pride ourselves on being your all-in-one
          solution for construction and building needs. With a dedication to
          excellence and a reputation founded on integrity, we are your trusted
          partner in the construction industry.
        </p>
      </JourneyHero>
      <AboutDescription />
      <WhyChooseRosecrest />
      <ClientTestimonials />
      <Footer />
    </div>
  );
};

export default Page;
