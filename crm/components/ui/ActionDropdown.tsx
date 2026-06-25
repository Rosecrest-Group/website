"use client";
import { useState, useRef, useEffect, ReactNode } from "react";

const buttonStyles = {
  outline: 'none',
  boxShadow: 'none',
  WebkitTapHighlightColor: 'transparent',
  border: 'none',
} as const;

export type DropdownAction = {
  id: string;
  label: string;
  icon: ReactNode;
  variant?: "default" | "danger";
};

type ActionDropdownProps = {
  actions: DropdownAction[];
  onActionClick: (actionId: string) => void;
};

export default function ActionDropdown({ actions, onActionClick }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      // Find the table row containing this button
      let currentElement: HTMLElement | null = buttonRef.current;
      let tableRow: HTMLTableRowElement | null = null;
      
      while (currentElement && !tableRow) {
        if (currentElement.tagName === 'TR') {
          tableRow = currentElement as HTMLTableRowElement;
          break;
        }
        currentElement = currentElement.parentElement;
      }
      
      // If we found a table row, check if it's one of the last 2 rows
      if (tableRow && tableRow.parentElement) {
        const tbody = tableRow.parentElement;
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        const currentRowIndex = allRows.indexOf(tableRow);
        const totalRows = allRows.length;
        
        // Flip upward for the last 2 rows
        if (currentRowIndex >= totalRows - 3) {
          setShouldOpenUp(true);
        } else {
          // For other rows, check viewport space
          const buttonRect = buttonRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - buttonRect.bottom;
          const spaceAbove = buttonRect.top;
          const dropdownHeight = 200;
          
          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            setShouldOpenUp(true);
          } else {
            setShouldOpenUp(false);
          }
        }
      } else {
        // Fallback to viewport-based detection if no table row found
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const dropdownHeight = 200;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setShouldOpenUp(true);
        } else {
          setShouldOpenUp(false);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const styleId = 'action-dropdown-no-outline';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .action-dropdown-btn,
        .action-dropdown-btn:focus,
        .action-dropdown-btn:focus-visible,
        .action-dropdown-btn:active,
        .action-dropdown-btn:hover {
          outline: none !important;
          box-shadow: none !important;
        }
        #action-dropdown > div[class*="absolute"] {
          outline: none !important;
          outline-width: 0 !important;
          outline-style: none !important;
          outline-color: transparent !important;
          border: none !important;
        }
        #action-dropdown > div[class*="absolute"]:focus,
        #action-dropdown > div[class*="absolute"]:focus-visible,
        #action-dropdown > div[class*="absolute"]:focus-within,
        #action-dropdown > div[class*="absolute"]:active,
        #action-dropdown > div[class*="absolute"]:hover,
        #action-dropdown > div[class*="absolute"]:focus-visible {
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
        .dropdown-animate {
          animation: dropdownFadeIn 0.2s ease-out;
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

  const handleActionClick = (action: string) => {
    setIsOpen(false);
    onActionClick(action);
  };

  return (
    <div ref={dropdownRef} id="action-dropdown" className="relative inline-block">
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
        className="action-dropdown-btn bg-transparent text-slate-400 hover:text-slate-600 inline-flex"
        style={buttonStyles}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 12h.01M8 12h.01M16 12h.01"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`dropdown-animate absolute right-0 w-[220px] bg-white rounded-[20px] shadow-[0_2px_8px_rgba(154,151,151,0.25)] z-50 ${
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
            {actions.map((action, index) => {
              const isDanger = action.variant === "danger";
              const dividerClass = "mx-auto w-[85%] h-[1px] bg-tc-20";
              
              return (
                <div key={action.id}>
                  {index > 0 && <div className={dividerClass}></div>}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleActionClick(action.id)}
                    onFocus={(e) => e.target.blur()}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }}
                    className={`action-dropdown-btn bg-transparent w-full px-6 py-3 text-left text-base font-medium transition-colors duration-150 hover:bg-gray-100 flex items-center gap-3 ${
                      isDanger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                    }`}
                    style={buttonStyles}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {action.icon}
                    </div>
                    <span className={`border-l-[0.4px] border-tc-20 pl-3 py-1`}>
                      {action.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}