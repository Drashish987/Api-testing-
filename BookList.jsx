import { useEffect, useState } from 'react';
import BookForm from './BookForm';

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [currentBook, setCurrentBook] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3545/api/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Add a new book
  const handleAddBook = async (book) => {
    setFormLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3545/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (!res.ok) throw new Error('Failed to add book');
      setMessage('Book added successfully!');
      fetchBooks();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit a book
  const handleEditBook = (book) => {
    setFormMode('edit');
    setCurrentBook(book);
  };

  // Update a book
  const handleUpdateBook = async (updatedBook) => {
    setFormLoading(true);
    setMessage('');
    try {
      const res = await fetch(`http://localhost:3545/api/books/${currentBook._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook),
      });
      if (!res.ok) throw new Error('Failed to update book');
      setMessage('Book updated successfully!');
      setFormMode('add');
      setCurrentBook(null);
      fetchBooks();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete a book
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    setMessage('');
    try {
      const res = await fetch(`http://localhost:3545/api/books/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete book');
      setMessage('Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setFormMode('add');
    setCurrentBook(null);
    setMessage('');
  };

  if (loading) return <p>Loading books...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Book List</h2>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
      <BookForm
        initialData={formMode === 'edit' ? currentBook : {}}
        onSubmit={formMode === 'edit' ? handleUpdateBook : handleAddBook}
        onCancel={formMode === 'edit' ? handleCancelEdit : undefined}
        loading={formLoading}
      />
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book._id}>
              <strong>{book.title}</strong> by {book.author} ({book.genre}, {book.publishedYear})
              <button onClick={() => handleEditBook(book)} style={{ marginLeft: 8 }}>Edit</button>
              <button onClick={() => handleDeleteBook(book._id)} style={{ marginLeft: 4, color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookList; 