import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./FilterSelect.css";

function FilterSelect({ id, label, value, options = [], onChange, className = "", portalMenu = false, disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.valor === value) || options[0];
  const [menuStyle, setMenuStyle] = useState({});

  useEffect(() => {
    const handleOutside = (event) => {
      const clickedInsideWrapper = wrapperRef.current?.contains(event.target);
      const clickedInsideMenu = menuRef.current?.contains(event.target);

      if (!clickedInsideWrapper && !clickedInsideMenu) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (!portalMenu || !wrapperRef.current) return;
    const trigger = wrapperRef.current.querySelector(".filter-select-trigger");
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 1000,
    });
  }, [portalMenu]);

  useEffect(() => {
    if (!open || !portalMenu) return undefined;
    updateMenuPosition();
    const handlePositionChange = () => updateMenuPosition();
    window.addEventListener("resize", handlePositionChange);
    window.addEventListener("scroll", handlePositionChange, true);
    return () => {
      window.removeEventListener("resize", handlePositionChange);
      window.removeEventListener("scroll", handlePositionChange, true);
    };
  }, [open, portalMenu, updateMenuPosition]);

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
      {label && <label htmlFor={id}>{label}</label>}

      <button
        id={id}
        type="button"
        className="filter-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((current) => !current)}
      >
        <span>{selected?.nombre}</span>
        <span className="filter-select-chevron" aria-hidden="true" />
      </button>

      {open && (
        portalMenu
          ? createPortal(
              <div
                ref={menuRef}
                className="filter-select-menu filter-select-menu-portal"
                role="listbox"
                aria-label={label}
                style={menuStyle}
              >
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
              </div>,
              document.body
            )
          : (
              <div ref={menuRef} className="filter-select-menu" role="listbox" aria-label={label}>
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
            )
      )}
    </div>
  );
}

export default FilterSelect;
