import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@components/icons";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onChange,
  label,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const uniqueId = React.useId();
  const dropdownId = label
    ? label.replace(/\s+/g, "-").toLowerCase()
    : uniqueId;

  // handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !optionsRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // position calculation for portal
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const optionsHeight = optionsRef.current?.offsetHeight || 200;

      const top =
        spaceBelow < optionsHeight && spaceAbove > spaceBelow
          ? rect.top - optionsHeight + 20
          : rect.bottom + 8;

      setDropdownPosition({
        top,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const handleOptionClick = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-sm font-medium text-text-secondary mb-2 text-center"
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={dropdownId}
        className={`w-full flex items-center justify-between p-3 
          bg-surface-200 border border-border text-text-primary rounded-xl 
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary 
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-surface-200/80"
          }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${dropdownId}-listbox`}
      >
        <span>{selectedOption?.label || "Select..."}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* portal-based dropdown */}
      {isOpen &&
        dropdownPosition &&
        createPortal(
          <ul
            ref={optionsRef}
            role="listbox"
            id={`${dropdownId}-listbox`}
            className="fixed bg-surface-100 border border-border rounded-xl 
              shadow-2xl max-h-60 overflow-auto scrollbar-thin 
              scrollbar-thumb-surface-200 scrollbar-track-surface-100 
              z-[9999] animate-fade-in"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === selectedValue}
                className={`p-3 cursor-pointer transition-colors 
                  hover:bg-surface-200/70 ${
                    option.value === selectedValue
                      ? "bg-surface-200/60 text-text-primary"
                      : "text-text-primary"
                  }`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
};

export default Dropdown;
