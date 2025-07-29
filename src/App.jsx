import { useEffect, useState } from 'react';
import BookDisplay from './components/BookDisplay';

function App() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

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
    const countries = [...new Set(data.map(b => b.country))];
    const languages = [...new Set(data.map(b => b.language))];
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
    applyFilters(newFilters);
  };

  const applyFilters = (activeFilters) => {
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

    setFilteredBooks(result);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Book Library</h1>

      {/* Filter Panel */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <select name="country" onChange={handleFilterChange} value={filters.country}>
          <option value="All">All Countries</option>
          {options.countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select name="language" onChange={handleFilterChange} value={filters.language}>
          <option value="All">All Languages</option>
          {options.languages.map((l, i) => <option key={i} value={l}>{l}</option>)}
        </select>

        <select name="pageRange" onChange={handleFilterChange} value={filters.pageRange}>
          <option value="All">All Page Ranges</option>
          {options.pageRanges.map((r, i) => <option key={i} value={r}>{r} pages</option>)}
        </select>

        <select name="year" onChange={handleFilterChange} value={filters.year}>
          <option value="All">All Years</option>
          {options.years.map((y, i) => <option key={i} value={y}>{y}</option>)}
        </select>
      </div>

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
