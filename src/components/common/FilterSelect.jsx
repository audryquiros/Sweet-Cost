import { useEffect, useRef, useState } from "react";
import "./FilterSelect.css";

function FilterSelect({ id, label, value, options, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = options.find((option) => option.valor === value) || options[0];

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className={`filter-select ${open ? "is-open" : ""} ${className}`} ref={wrapperRef}>
      <label htmlFor={id}>{label}</label>

      <button
        id={id}
        type="button"
        className="filter-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.nombre}</span>
        <span className="filter-select-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => {
            const isSelected = option.valor === value;

            return (
              <button
                key={option.valor}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`filter-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onChange(option.valor);
                  setOpen(false);
                }}
              >
                <span>{option.nombre}</span>
                {isSelected && <span className="filter-select-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FilterSelect;
