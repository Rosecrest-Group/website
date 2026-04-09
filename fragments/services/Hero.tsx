import React from "react";
import Image from "next/image";

const ServicesHero = () => {
  return (
    <div className="relative w-full min-h-[95vh]">
      {/* Background Image */}
      <Image
        src="/assets/images/landing-hero.png"
        alt="Property background"
        fill
        priority
        className="object-cover"
        quality={90}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#151515CC]" />

      {/* Content */}
      <div className="relative z-10 rounded-4xl w-full pt-44 lg:pt-56 pb-72 lg:pb-80 text-center px-4">
        <div className="text-white text-4xl lg:text-7xl tracking-tight leading-[100%]">
          Our Comprehensive Services
        </div>
        <p className="mt-10 lg:w-[50%] mx-auto text-[#E5E7EB] text-base lg:text-xl leading-relaxed">
          Explore our professional surveying and specialist trade services,
          designed to give you clarity and confidence in your property
          decisions.
        </p>
      </div>
    </div>
  );
};

export default ServicesHero;
