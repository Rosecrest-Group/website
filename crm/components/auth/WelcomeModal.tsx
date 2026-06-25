'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '@/crm/components/ui/PrimaryButton';
import SecondaryButton from '@/crm/components/ui/SecondaryButton';
import Logo from '@/crm/components/ui/Logo';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const router = useRouter();

  const handleSetupProfile = () => {
    router.push('/db/settings');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-[95vw] sm:w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo Icon */}
              <div className="flex justify-center">
                <Logo variant="primary" size="lg" />
              </div>

              {/* Title */}
              <h3 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 pt-3 sm:pt-4 pb-2 leading-none sm:leading-tight md:leading-normal">
                Great! You're almost set. Here's what comes next:
              </h3>

              {/* Action Items */}
              <div className="space-y-4 sm:space-y-4 mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 pt-2 sm:pt-0">
                <div className="flex items-start gap-3 sm:gap-3">
                  <div className="shrink-0 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="sm:w-5 sm:h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="var(--color-primary)"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">Complete your freelancer profile</p>
                </div>

                <div className="flex items-start gap-3 sm:gap-3">
                  <div className="shrink-0 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="sm:w-5 sm:h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="var(--color-primary)"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">Upload your best work</p>
                </div>

                <div className="flex items-start gap-3 sm:gap-3">
                  <div className="shrink-0 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="sm:w-5 sm:h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="var(--color-primary)"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">Get job matches tailored to your expertise</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <SecondaryButton
                  onClick={onClose}
                  className="w-full sm:flex-1 border-(--color-primary) text-(--color-primary)"
                >
                  Explore remotah
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleSetupProfile}
                  className="w-full sm:flex-1"
                >
                  Set up your profile
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
