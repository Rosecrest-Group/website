"use client";

import Footer from "@/components/common/Footer";
import FAQ from "@/fragments/homebuyer/FAQs";
import MoreInfo from "@/fragments/homebuyer/MoreInfo";
import Surverys from "@/fragments/homebuyer/Surverys";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import BookingModal from "@/components/homebuyer/BookingModal";
import { sourceSans } from "@/lib/fonts";
import { useState, useCallback } from "react";
import { OpenBookingModal } from "@/types/homebuyer";

const Page = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    surveyLevel?: 1 | 2 | 3;
    surveyTitle?: string;
    basePrice?: number;
  }>({});

  const openBookingModal: OpenBookingModal = useCallback((options = {}) => {
    setModalProps(options);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Buying a property?
        </p>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Choose the Right Survey in 60 Seconds
        </p>
        <p
          className={`${sourceSans.className} mt-5 sm:mt-10 mx-auto text-white text-base lg:text-2xl leading-relaxed`}
        >
          We&apos;ll help you select the most suitable survey based on the
          property you&apos;re purchasing.
        </p>
      </JourneyHero>

      <Surverys onOpenBooking={openBookingModal} />
      <MoreInfo onOpenBooking={openBookingModal} />
      <FAQ />
      <Footer />

      <BookingModal
        key={modalProps?.surveyLevel}
        isOpen={modalOpen}
        onClose={closeModal}
        {...modalProps}
      />
    </div>
  );
};

export default Page;
