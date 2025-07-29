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
    year: 'All',
  });

  // Store unique options for dropdowns
  const [options, setOptions] = useState({
    countries: [],
    languages: [],
    pageRanges: [],
    years: [],
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

  const extractOptions = (data) => {
    const countries = [...new Set(data.map(b => b.country))].sort();
    const languages = [...new Set(data.map(b => b.language))].sort();
    const years = [...new Set(data.map(b => b.year))].sort((a, b) => a - b);

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

    setOptions({ countries, languages, years, pageRanges });
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
      year: 'All',
    };

    setFilters(resetFilters);
    setSearchQuery('');
    setShowFilters(false); // optional: hide filters after reset
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

    if (activeFilters.year !== 'All') {
      result = result.filter(b => b.year === parseInt(activeFilters.year));
    }

    // Apply title search (case-insensitive)
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
            <label htmlFor="year">Filter by Year:</label><br />
            <select name="year" id="year" onChange={handleFilterChange} value={filters.year}>
              <option>All</option>
              {options.years.map(y => <option key={y}>{y}</option>)}
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
