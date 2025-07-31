import { useEffect, useState } from 'react';
import BookDisplay from './components/BookDisplay';

function App() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const isMobile = window.innerWidth <= 768;

  const filterToggleStyle = {
    marginBottom: '10px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    border: 'none',
    backgroundColor: '#ddd',
    borderRadius: '5px',
    ...(isMobile && {

    })
  };

  const filterPanelStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginBottom: '30px',
    ...(isMobile && {
      top: '3.5rem', // space below the toggle button
      width: '50vw',
      maxWidth: '200px',
      flexDirection: 'column',
      padding: '0.75rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      zIndex: 1000,
    })
  };


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
        const sortedData = data.slice().sort((a, b) => a.title.localeCompare(b.title));
        setBooks(sortedData);
        setFilteredBooks(sortedData);
        extractOptions(sortedData);
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

    result.sort((a, b) => a.title.localeCompare(b.title));
    setCurrentPage(1); // Reset to first page whenever filters/search applied
    setFilteredBooks(result);
  };

  return (
    <div style={{
        /*padding: '2rem',*/
        maxWidth: '100%',
        width: '100%',
      }} 
      className="page-container">
      
      <div style={{
        width: '100%',
        height: '3rem',
        backgroundColor: '#ff5036',
      }}/>
      
      {/*div for top bar*/}
      <div style={{
        marginLeft: '10rem',
        marginRight: '10rem',
        ...(isMobile && {
          marginLeft: '5rem',
          marginRight: '5rem',
        })
      }}>

      <div
        style={{
          fontWeight: '700',
          fontSize: '3.5rem',
          marginTop: '2rem',
          ...(isMobile && {
            fontSize: '2rem',
            marginTop: '2rem',
          })
        }}
      >Umazon Books</div>
      <div
        style={{
          fontWeight: '100',
          fontSize: '1.5rem',
          color: 'gray',
          marginBottom: '1rem',
          ...(isMobile && {
            fontSize: '1rem',
          })
        }}
      >#Umazing selection!</div>

      <div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={filterToggleStyle}
        >
          {showFilters ? '✕ Close Filters' : '☰ Filters'}
        </button>
        <input
          type="text"
          placeholder="Search book title..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '0.5rem', width: '50vw', marginBottom: '30px' }}
        />
      </div>
      

      {/* Filter Panel */}
      {showFilters && (
        <div style={filterPanelStyle}>
          <div>
            <label htmlFor="country">Filter by Country:</label><br />
            <select name="country" id="country" onChange={handleFilterChange} value={filters.country}
              style={{
                ...(isMobile && {
                  maxWidth: '150px',
                })
              }}
            >
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
      </div>
      {/*End div for top bar*/}

      <div style={{
        width: '100%',
        height: '150px',
        backgroundImage: 'url("/wood-bg2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...(isMobile && {
          height: '100px',
        })
      }}></div>

      {/* Book Display Grid */}
      <div
        style={{
          padding: '1rem',
          marginTop: '2rem',
          width: '75%',
          margin: '1rem auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
          }}
        >
          {filteredBooks
            .slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage)
            .map((book, index) => (
              <BookDisplay key={index} book={book} />
            ))}
        </div>
      </div>


      {/* Pagination Controls */}
      <div>
        {filteredBooks.length > booksPerPage && (
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px', 
              marginTop: '30px', 
              marginBottom: '20px',
              ...(isMobile && {
                marginTop: '15px', 
                marginBottom: '10px',
                gap: '6px',
                fontSize: '0.8rem',
              })
            }}>
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Prev
            </button>

            {[...Array(Math.ceil(filteredBooks.length / booksPerPage)).keys()].map(i => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === Math.ceil(filteredBooks.length / booksPerPage)}
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Next
            </button>
          </div>
        )}
        <div style={{ 
          textAlign: 'center', 
          margin: '20px 0',
          ...(isMobile && {
            margin: '12px',
            fontSize: '0.8rem',
          })
        }}>
          <label htmlFor="booksPerPage">Books per page:&nbsp;</label>
          <select
            id="booksPerPage"
            value={booksPerPage}
            onChange={(e) => {
              setBooksPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing size
            }}
            style={{ padding: '0.4rem', fontSize: '1rem' }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

      </div>
    </div>
  );
}

export default App;
