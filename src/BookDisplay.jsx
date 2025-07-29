

export default function BookCard({ book }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '200px' }}>
      <img src={book.cover} alt={book.title} style={{ width: '100%' }} />
      <h3>{book.title}</h3>
      <p><em>{book.author}</em></p>
    </div>
  );
}
