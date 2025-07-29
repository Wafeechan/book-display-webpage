export default function BookDisplay({ book }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '10px',
      padding: '1rem',
      width: '250px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <img
        src={book.imageLink}
        alt={book.title}
        style={{ width: '150px', height: 'auto', marginBottom: '1rem' }}
      />
      <h3 style={{ textAlign: 'center' }}>{book.title}</h3>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Country:</strong> {book.country}</p>
      <p><strong>Language:</strong> {book.language}</p>
      <p><strong>Pages:</strong> {book.pages}</p>
      <p><strong>Year:</strong> {book.year}</p>
      <a
        href={book.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: '0.5rem', color: 'blue', textDecoration: 'underline' }}
      >
        View on Wikipedia
      </a>
    </div>
  );
}
