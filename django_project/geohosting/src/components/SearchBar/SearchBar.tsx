import React, { useState } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  showClearButton?: boolean;
  showDateFields?: boolean;
  onSearch?: (term: string) => void; 
  placeholder?: string; 
}

const SearchBar: React.FC<SearchBarProps> = ({
  showClearButton = false,
  showDateFields = false,
  onSearch,
  placeholder = 'Search Items', // Default placeholder
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  // Clear all fields
  const handleClear = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  // Clear individual dates
  const clearStartDate = () => setStartDate('');
  const clearEndDate = () => setEndDate('');

  return (
    <div style={styles.container}>
      {/* Search Field */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          style={styles.searchField}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4f9ac0')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        />
        <FaSearch style={styles.searchIcon} />
      </div>

      {/* Date Fields: Optional */}
      {showDateFields && (
        <>
          {/* Start Date Picker */}
          <div style={styles.dateContainer}>
            <label style={styles.dateLabel}>Start:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.datePicker}
            />
            {startDate && (
              <FaTimes 
                onClick={clearStartDate} 
                style={styles.clearIconOutside}
              />
            )}
          </div>

          {/* End Date Picker */}
          <div style={styles.dateContainer}>
            <label style={styles.dateLabel}>End:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.datePicker}
            />
            {endDate && (
              <FaTimes 
                onClick={clearEndDate} 
                style={styles.clearIconOutside}
              />
            )}
          </div>
        </>
      )}

      {/* Clear Button: Optional */}
      {showClearButton && (
        <button onClick={handleClear} style={styles.clearButton}>
          Clear
        </button>
      )}
    </div>
  );
};

// Styles using a JavaScript object
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0px',
    gap: '24px',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: '900px',
    margin: '0',
    marginBottom: '5px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '250px',
    maxWidth: '400px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: '20px',
    bottom: '25px',
    color: 'gray',
    fontSize: '16px',
  },
  searchField: {
    flex: 1,
    padding: '10px 10px 10px 20px', 
    height: '100%',
    border: '0px',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginBottom: '10px',
  },
  dateContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    flex: '1 1 250px',
  },
  dateLabel: {
    marginRight: '8px',
    fontSize: '14px',
  },
  datePicker: {
    padding: '10px',
    height: '100%',
    border: '0px',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  clearIconOutside: {
    marginLeft: '10px',
    cursor: 'pointer',
    color: '#333',
    fontSize: '16px',
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#4f9ac0',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
    flex: '1 1 150px',
  },
};

export default SearchBar;
