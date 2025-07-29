import React from 'react';
import './BookDisplay.css'; 

const BookDisplay = ({ book }) => {
  return (
    <div className="book-card">
      <div className="book-image-container">
        <img
          src={`/images/${book.imageLink}`}
          alt={book.title}
          className="book-image"
          onError={(e) => {
            e.target.src = 'https://placehold.co/150x200?text=No+Image';
          }}
        />
        <div className="hover-info">
          <p><strong>Country:</strong> {book.country}</p>
          <p><strong>Language:</strong> {book.language}</p>
          <p><strong>Pages:</strong> {book.pages}</p>
          <p><strong>Year:</strong> {book.year}</p>
        </div>
      </div>

      <h3>{book.title}</h3>
      <p>{book.author}</p>
      <a href={book.link} target="_blank" rel="noopener noreferrer">Wikipedia</a>
    </div>
  );
};

export default BookDisplay;
