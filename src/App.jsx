import { useEffect, useState } from 'react';
import BookDisplay from './components/BookDisplay';

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('/books.json')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Book Library</h1>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'center',
        marginTop: '2rem'
      }}>
        {books.map((book, index) => (
          <BookDisplay key={index} book={book} />
        ))}
      </div>
    </div>
  );
}

export default App;
