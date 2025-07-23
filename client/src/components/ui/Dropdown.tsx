
import React from "react";
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

const Dropdown: React.FC<DropdownProps> = ({ options, selectedValue, onChange, label, disabled = false }) => {
  const selectedOption = options.find(opt => opt.value === selectedValue);
  const uniqueId = React.useId();
  const selectId = label ? label.replace(/\s+/g, '-').toLowerCase() : uniqueId;

  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary mb-2 text-center">{label}</label>}

      <div className="relative group">
        {/* This is the styled appearance that the user sees */}
        <div
          aria-hidden="true"
          className="w-full flex items-center justify-between p-3 bg-surface-200/50 border border-border text-text-primary rounded-xl transition-colors group-focus-within:ring-2 group-focus-within:ring-primary"
        >
          <span>{selectedOption?.label || "Select..."}</span>
          <ChevronDownIcon className="w-5 h-5 text-text-secondary transition-transform duration-200 group-focus-within:rotate-180" />
        </div>

        {/* This is the actual select element. It's invisible but provides all functionality. */}
        <select
          id={selectId}
          value={selectedValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label={label || selectedOption?.label}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Dropdown;
