import React, { useState, useEffect, useRef } from 'react';
import birdSpeciesData from '../data/bird-species.json';
import './SpeciesAutocomplete.css';

const SpeciesAutocomplete = ({ value, onChange, placeholder = "Search for bird species..." }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const filterSuggestions = (input) => {
    if (!input.trim()) return [];
    
    const searchTerm = input.toLowerCase();
    return birdSpeciesData
      .filter(bird => 
        bird.common_name.toLowerCase().includes(searchTerm) ||
        bird.scientific_name.toLowerCase().includes(searchTerm) ||
        bird.family.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        // Prioritize exact matches and common names starting with search term
        const aCommon = a.common_name.toLowerCase();
        const bCommon = b.common_name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        if (aCommon.startsWith(searchLower) && !bCommon.startsWith(searchLower)) return -1;
        if (!aCommon.startsWith(searchLower) && bCommon.startsWith(searchLower)) return 1;
        
        return aCommon.localeCompare(bCommon);
      })
      .slice(0, 8); // Limit to 8 suggestions
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const newSuggestions = filterSuggestions(newValue);
    setSuggestions(newSuggestions);
    setIsOpen(newSuggestions.length > 0);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (bird) => {
    const selectedValue = bird.common_name;
    setInputValue(selectedValue);
    setIsOpen(false);
    onChange(bird);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e) => {
    // Delay closing to allow for click events on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleFocus = () => {
    if (inputValue && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const clearSelection = () => {
    setInputValue('');
    onChange(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="species-autocomplete">
      <div className="species-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="species-input"
          autoComplete="off"
        />
        {inputValue && (
          <button 
            type="button"
            onClick={clearSelection}
            className="clear-species-btn"
            aria-label="Clear species"
          >
            ×
          </button>
        )}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="species-suggestions">
          {suggestions.map((bird, index) => (
            <div
              key={bird.id}
              className={`species-suggestion ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(bird)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="species-names">
                <span className="common-name">{bird.common_name}</span>
                <span className="scientific-name">{bird.scientific_name}</span>
              </div>
              <div className="species-family">{bird.family}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeciesAutocomplete;
