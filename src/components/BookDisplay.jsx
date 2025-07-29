const BookDisplay = ({ book }) => {
  return (
    <div className="w-48 m-4 text-center font-sans">
      <div className="relative w-full h-72 overflow-hidden rounded-lg group">
        <img
          src={`/images/${book.imageLink}`}
          alt={book.title}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-30"
          onError={(e) => {
            e.target.src = 'https://placehold.co/150x200';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-75 text-white flex flex-col justify-center items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <p><strong>Country:</strong> {book.country}</p>
          <p><strong>Language:</strong> {book.language}</p>
          <p><strong>Pages:</strong> {book.pages}</p>
          <p><strong>Year:</strong> {book.year}</p>
        </div>
      </div>

      <h3 className="mt-2 text-lg font-semibold">{book.title}</h3>
      <p className="text-sm text-gray-700">{book.author}</p>
      <a
        href={book.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline text-sm"
      >
        Wikipedia
      </a>
    </div>
  );
};

export default BookDisplay;
