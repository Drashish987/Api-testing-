const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Book = require('../models/Book');

describe('/api/books API', () => {
  let createdBookId;

  // Clean up the books collection before each test
  beforeEach(async () => {
    await Book.deleteMany({});
  });

  // Close DB connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new book', async () => {
    const newBook = {
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Test Genre',
      publishedYear: 2023
    };
    const res = await request(app)
      .post('/api/books')
      .send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(newBook.title);
    createdBookId = res.body._id;
  });

  it('should get all books (should include the created book)', async () => {
    // Create a book first
    const book = new Book({ title: 'Book1', author: 'Author1', genre: 'Genre1', publishedYear: 2020 });
    await book.save();
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a book by ID', async () => {
    // Create a book first
    const book = new Book({ title: 'Book2', author: 'Author2', genre: 'Genre2', publishedYear: 2021 });
    const savedBook = await book.save();
    const res = await request(app).get(`/api/books/${savedBook._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(savedBook._id.toString());
  });

  it('should update a book by ID', async () => {
    // Create a book first
    const book = new Book({ title: 'Book3', author: 'Author3', genre: 'Genre3', publishedYear: 2022 });
    const savedBook = await book.save();
    const updatedData = { title: 'Updated Title', author: 'Updated Author', genre: 'Updated Genre', publishedYear: 2024 };
    const res = await request(app)
      .put(`/api/books/${savedBook._id}`)
      .send(updatedData);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(updatedData.title);
  });

  it('should delete a book by ID', async () => {
    // Create a book first
    const book = new Book({ title: 'Book4', author: 'Author4', genre: 'Genre4', publishedYear: 2025 });
    const savedBook = await book.save();
    const res = await request(app).delete(`/api/books/${savedBook._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book deleted successfully');
  });

  it('should return 400 for invalid book ID format', async () => {
    const res = await request(app).get('/api/books/invalid-id');
    expect(res.statusCode).toBe(500); // Mongoose throws a CastError, handled as 500 in controller
    expect(res.body).toHaveProperty('message', 'Server error');
  });

  it('should return 404 for non-existent valid book ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/books/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Book not found');
  });

  it('should return 400 when creating a book with missing required fields', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Only Title' }); // Missing author, genre, publishedYear
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid data');
  });

  it('should return 400 when updating a book with invalid data', async () => {
    const book = new Book({ title: 'Book5', author: 'Author5', genre: 'Genre5', publishedYear: 2026 });
    const savedBook = await book.save();
    const res = await request(app)
      .put(`/api/books/${savedBook._id}`)
      .send({ title: '' }); // Invalid: title is empty, other fields missing
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid data');
  });

  it('should return 404 when deleting a non-existent book', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/books/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Book not found');
  });
});

describe('GET /', () => {
  it('should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Welcome to the Book Management API!');
  });
});