"use client";
import { useState, useRef, useEffect } from "react";

const banks = [
  { value: "none", label: "None" },
  { value: "add_new", label: "Add new" },
  { value: "bank_a", label: "Bank A" },
  { value: "bank_b", label: "Bank B" },
  { value: "bank_c", label: "Bank C" },
];

type BankDropdownProps = {
  value?: string;
  onChange?: (bank: string) => void;
  className?: string;
};

const buttonStyles = {
  outline: 'none',
  boxShadow: 'none',
  WebkitTapHighlightColor: 'transparent',
  border: 'none',
} as const;

export default function BankDropdown({ 
  value = "none", 
  onChange,
  className = ""
}: BankDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const selectedBank = banks.find(b => b.value === value) || banks[0];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile overlay is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (isMobile) {
        if (sheetRef.current && event.target === sheetRef.current) {
          setIsOpen(false);
        }
      } else {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside as EventListener);
      document.addEventListener("touchstart", handleClickOutside as EventListener);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside as EventListener);
        document.removeEventListener("touchstart", handleClickOutside as EventListener);
      };
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen && buttonRef.current && !isMobile) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = 300;
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setShouldOpenUp(true);
      } else {
        setShouldOpenUp(false);
      }
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    const styleId = 'bank-dropdown-no-outline';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .bank-dropdown-btn,
        .bank-dropdown-btn:focus,
        .bank-dropdown-btn:focus-visible,
        .bank-dropdown-btn:active,
        .bank-dropdown-btn:hover {
          outline: none !important;
          box-shadow: none !important;
        }
        #bank-dropdown > div[class*="absolute"] {
          outline: none !important;
          outline-width: 0 !important;
          outline-style: none !important;
          outline-color: transparent !important;
          border: none !important;
        }
        #bank-dropdown > div[class*="absolute"]:focus,
        #bank-dropdown > div[class*="absolute"]:focus-visible,
        #bank-dropdown > div[class*="absolute"]:focus-within,
        #bank-dropdown > div[class*="absolute"]:active,
        #bank-dropdown > div[class*="absolute"]:hover,
        #bank-dropdown > div[class*="absolute"]:focus-visible {
          outline: none !important;
          outline-width: 0 !important;
          outline-style: none !important;
          outline-color: transparent !important;
          box-shadow: 0 2px 8px rgba(154,151,151,0.25) !important;
          border: none !important;
        }
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes sheetSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .dropdown-animate {
          animation: dropdownFadeIn 0.2s ease-out;
        }
        .backdrop-animate {
          animation: backdropFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sheet-animate {
          animation: sheetSlideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `;
      document.head.appendChild(style);
      return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  const handleBankClick = (bankValue: string) => {
    setIsOpen(false);
    if (onChange) {
      onChange(bankValue);
    }
  };

  return (
    <div ref={dropdownRef} id="bank-dropdown" className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={(e) => e.target.blur()}
        onMouseDown={(e) => {
          e.preventDefault();
          e.currentTarget.blur();
        }}
        className="bank-dropdown-btn w-full sm:w-[120px] h-12 px-3 rounded-3xl border border-(--color-tc-20) text-sm text-(--color-tc-40) outline-none focus:ring-2 focus:ring-(--color-primary)/20 appearance-none cursor-pointer flex items-center justify-between gap-2"
        style={{ ...buttonStyles, backgroundColor: 'var(--color-nc-20)' }}
      >
        <span className="flex-1 flex items-center justify-center gap-2">
          <span>{selectedBank.label}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="h-6 w-6 transition-transform shrink-0"
        >
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10l5 5m0 0l5-5" className="text-(--color-tc-40)" />
        </svg>
      </button>

      {isOpen && isMobile ? (
        <div
          ref={sheetRef}
          className="fixed inset-0 z-[9999] backdrop-animate"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === sheetRef.current) {
              setIsOpen(false);
            }
          }}
        >
          <div
            className="sheet-animate fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.15)] z-[10000] max-h-[85vh] overflow-hidden flex flex-col"
            style={{
              outline: 'none',
              outlineWidth: 0,
              outlineStyle: 'none',
              outlineColor: 'transparent',
              border: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="px-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Select Bank</h3>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {banks.map((bank, index) => {
                const isSelected = bank.value === value;
                const dividerClass = "mx-auto w-[85%] h-[1px] bg-tc-20";
                
                return (
                  <div key={bank.value}>
                    {index > 0 && <div className={dividerClass}></div>}
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => handleBankClick(bank.value)}
                      onFocus={(e) => e.target.blur()}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }}
                      onTouchStart={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onTouchEnd={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      className="bank-dropdown-btn bg-transparent w-full px-6 py-4 text-left text-base font-medium transition-colors duration-150 active:bg-gray-100 flex items-center gap-3 text-gray-700"
                      style={buttonStyles}
                    >
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-gray-700">
                          {bank.label}
                        </span>
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {isSelected ? (
                            <div className="relative w-5 h-5">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                                <circle cx="10" cy="10" r="9.45" stroke="var(--color-primary)" strokeWidth="0.9"/>
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[--color-primary]"></div>
                              </div>
                            </div>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9.45" stroke="#9CA3AF" strokeWidth="0.9"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : isOpen && !isMobile ? (
        <div 
          className={`dropdown-animate absolute left-0 min-w-[200px] bg-white rounded-[20px] shadow-[0_2px_8px_rgba(154,151,151,0.25)] z-50 ${
            shouldOpenUp ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          style={{ 
            outline: 'none', 
            outlineWidth: 0,
            outlineStyle: 'none',
            outlineColor: 'transparent',
            border: 'none'
          }}
          onFocus={(e) => e.currentTarget.blur()}
          tabIndex={-1}
        >
          <div className="py-2">
            {banks.map((bank, index) => {
              const isSelected = bank.value === value;
              const dividerClass = "mx-auto w-[85%] h-[1px] bg-tc-20";
              
              return (
                <div key={bank.value}>
                  {index > 0 && <div className={dividerClass}></div>}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleBankClick(bank.value)}
                    onFocus={(e) => e.target.blur()}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }}
                    className="bank-dropdown-btn bg-transparent w-full px-6 py-3 text-left text-base font-medium transition-colors duration-150 hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                    style={buttonStyles}
                  >
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-gray-700">
                        {bank.label}
                      </span>
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {isSelected ? (
                          <div className="relative w-5 h-5">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                              <circle cx="10" cy="10" r="9.45" stroke="var(--color-primary)" strokeWidth="0.9"/>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-[--color-primary]"></div>
                            </div>
                          </div>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="9.45" stroke="#9CA3AF" strokeWidth="0.9"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
