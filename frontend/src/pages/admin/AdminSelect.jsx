import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import './AdminSelect.css';

const AdminSelect = ({ value, options, onChange, ariaLabel, triggerClassName = '', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const listId = useId();
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutsidePointer = event => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [isOpen]);

  const openMenu = focusSelected => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
    if (focusSelected) requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
  };

  const chooseOption = option => {
    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = event => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu(true);
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      setActiveIndex(nextIndex);
      optionRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="admin-select" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`admin-select-trigger ${triggerClassName}`.trim()}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => isOpen ? setIsOpen(false) : openMenu(false)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedOption?.label || ''}</span>
        <ChevronDown size={14} aria-hidden="true" className={isOpen ? 'is-open' : ''} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={listId}
            className="admin-select-menu"
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3, scale: 0.985 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            {options.map((option, index) => (
              <button
                key={option.value}
                ref={element => { optionRefs.current[index] = element; }}
                type="button"
                role="option"
                aria-selected={option.value === value}
                tabIndex={activeIndex === index ? 0 : -1}
                className={`admin-select-option${option.value === value ? ' is-selected' : ''}${activeIndex === index ? ' is-active' : ''}`}
                onClick={() => chooseOption(option)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={event => handleOptionKeyDown(event, index)}
              >
                <span>{option.label}</span>
                {option.value === value && <Check size={14} aria-hidden="true" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSelect;