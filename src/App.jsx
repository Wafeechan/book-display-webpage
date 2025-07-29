import { useEffect, useState } from 'react';
import BookDisplay from './BookDisplay';

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('/books.json')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Book Library</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {books.map(book => (
          <BookDisplay key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

export default App
