import { useEffect, useState } from 'react';
import BookDisplay from './components/BookDisplay';

function App() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    country: 'All',
    language: 'All',
    pageRange: 'All',
    yearRange: 'All',  // Changed from year to yearRange
  });

  // Store unique options for dropdowns
  const [options, setOptions] = useState({
    countries: [],
    languages: [],
    pageRanges: [],
    yearRanges: [],  // Changed from years to yearRanges
  });

  useEffect(() => {
    fetch('/books.json')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setFilteredBooks(data);
        extractOptions(data);
      });
  }, []);

  // Helper to get ordinal suffix for centuries
  const getOrdinalSuffix = (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'st';
    if (n % 10 === 2 && n % 100 !== 12) return 'nd';
    if (n % 10 === 3 && n % 100 !== 13) return 'rd';
    return 'th';
  };

  // Function to generate year range label based on your rules
  const getYearRangeLabel = (year) => {
    if (year < 0) return 'Before 0 (BC)';
    if (year < 1900) {
      const century = Math.floor((year - 1) / 100) + 1;
      return `${century}${getOrdinalSuffix(century)} Century`;
    }
    if (year < 2000) return '20th Century';
    const decade = Math.floor(year / 10) * 10;
    return `${decade}s`;
  };

  const extractOptions = (data) => {
    const countries = [...new Set(data.map(b => b.country))].sort();
    const languages = [...new Set(data.map(b => b.language))].sort();

    // Year ranges based on new logic
    const yearRangeSet = new Set(data.map(b => getYearRangeLabel(b.year)));
    const yearRanges = [...yearRangeSet].sort((a, b) => {
      // Sort "Before 0 (BC)" first, then centuries ascending, then decades ascending
      if (a === 'Before 0 (BC)') return -1;
      if (b === 'Before 0 (BC)') return 1;

      const centuryMatchA = a.match(/^(\d+)(st|nd|rd|th) Century$/);
      const centuryMatchB = b.match(/^(\d+)(st|nd|rd|th) Century$/);
      if (centuryMatchA && centuryMatchB) {
        return Number(centuryMatchA[1]) - Number(centuryMatchB[1]);
      }
      if (centuryMatchA) return -1;
      if (centuryMatchB) return 1;

      // Decade format like "2000s", "2010s"
      const decadeA = parseInt(a);
      const decadeB = parseInt(b);
      if (!isNaN(decadeA) && !isNaN(decadeB)) {
        return decadeA - decadeB;
      }

      return a.localeCompare(b);
    });

    // Generate page ranges
    const pageRangesSet = new Set();
    data.forEach(book => {
      const min = Math.floor((book.pages - 1) / 100) * 100 + 1;
      const max = min + 99;
      pageRangesSet.add(`${min}-${max}`);
    });
    const pageRanges = [...pageRangesSet].sort((a, b) => {
      const [aMin] = a.split('-').map(Number);
      const [bMin] = b.split('-').map(Number);
      return aMin - bMin;
    });

    setOptions({ countries, languages, pageRanges, yearRanges });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(newFilters, searchQuery);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters(filters, value);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      country: 'All',
      language: 'All',
      pageRange: 'All',
      yearRange: 'All',
    };

    setFilters(resetFilters);
    setSearchQuery('');
    setShowFilters(false);
    applyFilters(resetFilters, '');
  };

  const applyFilters = (activeFilters, titleQuery = '') => {
    let result = [...books];

    if (activeFilters.country !== 'All') {
      result = result.filter(b => b.country === activeFilters.country);
    }

    if (activeFilters.language !== 'All') {
      result = result.filter(b => b.language === activeFilters.language);
    }

    if (activeFilters.pageRange !== 'All') {
      const [min, max] = activeFilters.pageRange.split('-').map(Number);
      result = result.filter(b => b.pages >= min && b.pages <= max);
    }

    if (activeFilters.yearRange !== 'All') {
      result = result.filter(b => getYearRangeLabel(b.year) === activeFilters.yearRange);
    }

    if (titleQuery.trim() !== '') {
      result = result.filter(b =>
        b.title.toLowerCase().includes(titleQuery.toLowerCase())
      );
    }

    setFilteredBooks(result);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => setShowFilters(!showFilters)} style={{ marginBottom: '10px' }}>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <h1>Book Library</h1>

      <input
        type="text"
        placeholder="Search book title..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ padding: '0.5rem', width: '200px', marginBottom: '30px' }}
      />

      {/* Filter Panel */}
      {showFilters && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <div>
            <label htmlFor="country">Filter by Country:</label><br />
            <select name="country" id="country" onChange={handleFilterChange} value={filters.country}>
              <option>All</option>
              {options.countries.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="language">Filter by Language:</label><br />
            <select name="language" id="language" onChange={handleFilterChange} value={filters.language}>
              <option>All</option>
              {options.languages.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="pageRange">Filter by Page Range:</label><br />
            <select name="pageRange" id="pageRange" onChange={handleFilterChange} value={filters.pageRange}>
              <option>All</option>
              {options.pageRanges.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="yearRange">Filter by Year Range:</label><br />
            <select name="yearRange" id="yearRange" onChange={handleFilterChange} value={filters.yearRange}>
              <option>All</option>
              {options.yearRanges.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Book Display Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center'
      }}>
        {filteredBooks.map((book, index) => (
          <BookDisplay key={index} book={book} />
        ))}
      </div>
    </div>
  );
}

export default App;
