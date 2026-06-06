import { ChevronDown } from 'lucide-react';

type FilterAccordionProps = {
  title: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function FilterAccordion({ title, options, selected, onChange }: FilterAccordionProps) {
  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  };

  return (
    <details className="filter">
      <summary>
        <ChevronDown size={22} aria-hidden="true" />
        <span>{title}</span>
      </summary>
      <div className="filter__options">
        {options.length === 0 ? <span className="filter__empty">Sin opciones todavía</span> : null}
        {options.map((option) => (
          <label key={option} className="filter__option">
            <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
