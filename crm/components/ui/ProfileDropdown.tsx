"use client";

import type { SVGProps } from "react";
import { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function HelpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
};

type ProfileDropdownProps = {
  trigger: ReactNode;
  items: ProfileMenuItem[];
  userName?: string;
  userAvatar?: string;
};

const buttonStyles = {
  outline: 'none',
  boxShadow: 'none',
  WebkitTapHighlightColor: 'transparent',
  border: 'none',
} as const;

export default function ProfileDropdown({ trigger, items, userName, userAvatar }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    const styleId = 'profile-dropdown-no-outline';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .profile-dropdown-btn,
        .profile-dropdown-btn:focus,
        .profile-dropdown-btn:focus-visible,
        .profile-dropdown-btn:active,
        .profile-dropdown-btn:hover {
          outline: none !important;
          box-shadow: none !important;
        }
        #profile-dropdown > div[class*="absolute"] {
          outline: none !important;
          outline-width: 0 !important;
          outline-style: none !important;
          outline-color: transparent !important;
          border: none !important;
        }
        #profile-dropdown > div[class*="absolute"]:focus,
        #profile-dropdown > div[class*="absolute"]:focus-visible,
        #profile-dropdown > div[class*="absolute"]:focus-within,
        #profile-dropdown > div[class*="absolute"]:active,
        #profile-dropdown > div[class*="absolute"]:hover,
        #profile-dropdown > div[class*="absolute"]:focus-visible {
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

  const handleItemClick = (item: ProfileMenuItem) => {
    setIsOpen(false);
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div ref={dropdownRef} id="profile-dropdown" className="relative inline-block">
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
        className="profile-dropdown-btn"
        style={buttonStyles}
        aria-label="Open user menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div 
          className="dropdown-animate absolute right-0 top-full mt-2 w-[220px] bg-white rounded-[20px] shadow-[0_2px_8px_rgba(154,151,151,0.25)] z-50"
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
            {items.map((item) => {
              const isDanger = item.variant === "danger";
              
              const content = (
                <>
                  {isDanger && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      {item.icon}
                    </div>
                  )}
                  <span className="py-1">
                    {item.label}
                  </span>
                </>
              );

              const className = `profile-dropdown-btn bg-transparent w-full px-6 py-3 text-left text-base font-medium transition-colors duration-150 flex items-center ${isDanger ? 'gap-3' : ''} ${
                isDanger 
                  ? "text-red-600 hover:bg-red-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`;

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    onFocus={(e) => e.target.blur()}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }}
                    className={className}
                    style={buttonStyles}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleItemClick(item)}
                  onFocus={(e) => e.target.blur()}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }}
                  className={className}
                  style={buttonStyles}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
