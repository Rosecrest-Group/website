'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/crm/components/ui/Logo';

const testimonials = [
  {
    quote: "The quality of candidates we received through Remotah was higher than any other platform.",
    name: "Elena Madrid",
    role: "Business Analyst",
    avatar: "/tempavatar.png",
  },
  {
    quote: "Remotah helped me find my dream remote job within weeks. The process was seamless and professional.",
    name: "James Chen",
    role: "Software Engineer",
    avatar: "/tempavatar.png",
  },
  {
    quote: "As a recruiter, I've never had an easier time connecting with top-tier global talent. Highly recommend!",
    name: "Sarah Johnson",
    role: "HR Director",
    avatar: "/tempavatar.png",
  },
];

export default function AuthLeftPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Duplicate testimonials for infinite loop effect
  const extendedTestimonials = [...testimonials, ...testimonials];

  // Auto-swipe carousel - always goes left
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Reset to start seamlessly when reaching the cloned set
  useEffect(() => {
    if (currentSlide === testimonials.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 700);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 750);
    }
  }, [currentSlide]);

  return (
    <div 
      className="hidden lg:flex lg:w-1/2 relative h-screen overflow-y-auto bg-no-repeat bg-[length:100%_auto] xl:bg-cover"
      style={{ 
        backgroundImage: 'url(/images/signupladywider.jpg)',
        backgroundPosition: 'center 5%'
      }}
    >
      <div className="relative w-full min-h-full p-12 pb-8 flex flex-col">
       

        {/* Testimonials Carousel */}
        <div className="mt-auto -mx-12">
          <div className="relative overflow-hidden w-full pl-12">
            <div 
              className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ 
                width: `${extendedTestimonials.length * 65}%`,
                transform: `translateX(-${currentSlide * (100 / extendedTestimonials.length)}%)` 
              }}
            >
              {extendedTestimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 pr-3"
                  style={{ width: `${100 / extendedTestimonials.length}%` }}
                >
                  <div className="bg-white p-3 rounded-lg shadow-md h-[220px] flex flex-col">
                    <div className="bg-[#f3f3f3] rounded-md h-full flex flex-col px-4 pt-4 pb-4 relative">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24"
                        className="absolute top-4 left-4 z-10 text-blue-600"
                      >
                        <g fill="none">
                          <path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z"/>
                          <path fill="currentColor" d="M8.4 6.2a1 1 0 0 1 1.2 1.6c-1.564 1.173-2.46 2.314-2.973 3.31A3.5 3.5 0 1 1 4 14.558a7.565 7.565 0 0 1 .508-3.614C5.105 9.438 6.272 7.796 8.4 6.2m9 0a1 1 0 0 1 1.2 1.6c-1.564 1.173-2.46 2.314-2.973 3.31A3.5 3.5 0 1 1 13 14.558a7.565 7.565 0 0 1 .508-3.614c.598-1.506 1.764-3.148 3.892-4.744"/>
                        </g>
                      </svg>
                      <div className="flex mb-2 justify-end">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                          >
                            <path d="m12 16.102l-3.63 2.192q-.16.079-.297.064q-.136-.016-.265-.094q-.13-.08-.196-.226t-.012-.319l.966-4.11l-3.195-2.77q-.135-.11-.178-.263t.019-.293t.165-.23q.104-.087.28-.118l4.216-.368l1.644-3.892q.068-.165.196-.238T12 5.364t.288.073t.195.238l1.644 3.892l4.215.368q.177.03.281.119q.104.088.166.229q.061.14.018.293t-.178.263l-3.195 2.77l.966 4.11q.056.171-.011.318t-.197.226q-.128.08-.265.095q-.136.015-.296-.064z"/>
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm font-medium flex-1 min-h-0 mb-3 pt-3 pb-3 leading-[20px]">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-0">
                        <div className="flex items-center gap-2">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                            <p className="text-xs text-gray-600">{testimonial.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Logo variant="primary" size="sm" />
                          <span className="text-xs font-semibold text-gray-700">Remotah</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
