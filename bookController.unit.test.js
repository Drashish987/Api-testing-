const { getAllBooks } = require('../controllers/bookController');
const Book = require('../models/Book');

// Mock the response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getAllBooks (unit test)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all books (mocked)', async () => {
    const mockBooks = [
      { title: 'Book1', author: 'Author1', genre: 'Genre1', publishedYear: 2020 },
      { title: 'Book2', author: 'Author2', genre: 'Genre2', publishedYear: 2021 }
    ];
    jest.spyOn(Book, 'find').mockResolvedValue(mockBooks);
    const req = {};
    const res = mockResponse();
    await getAllBooks(req, res);
    expect(Book.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockBooks);
  });

  it('should handle errors and return 500', async () => {
    jest.spyOn(Book, 'find').mockRejectedValue(new Error('DB error'));
    const req = {};
    const res = mockResponse();
    await getAllBooks(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Server error' }));
  });
});
