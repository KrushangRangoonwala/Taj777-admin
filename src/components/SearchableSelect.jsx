import React, { useState, useRef } from 'react';
import { getClients } from '../api/API';

const SearchableSelect = ({
  placeholder = "Select option",
  onSelect,
  className = "form-control",
  style = {},
}) => {
  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchClients = async (value) => {
    try {
      const res = await getClients(value);
      setOptions(res.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    fetchClients(value);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setOptions([{ id: '1', text: "List is empty." }]);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setOptions([]);
    }, 200);
  };

  const handleSelect = (option) => {
    if (option.text === "List is empty." && option.id === '1') {
      return;
    }

    setSearchText(option.text);
    if (onSelect) {
      onSelect(option);
    }
    setIsOpen(false);
  };

  return (
    <div className="searchable-select-container" style={{ position: 'relative', ...style }} ref={containerRef}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={searchText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoComplete="off"
      />

      {isOpen && options.length > 0 && (
        <div
          className="searchable-select-dropdown"
          style={{
            position: 'absolute',
            background: '#fff',
            border: '1px solid #ddd',
            width: '100%',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className="searchable-select-item"
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: index === options.length - 1 ? 'none' : '1px solid #eee',
                backgroundColor: '#fff',
                transition: 'background-color 0.2s'
              }}
              onClick={() => handleSelect(option)}
            // onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            // onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
            >
              {option.text || option.label || option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
