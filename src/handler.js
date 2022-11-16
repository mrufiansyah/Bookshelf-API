const { nanoid } = require('nanoid');
const books = require('./books');

// Kriteria 1 : API dapat menyimpan buku
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // tidak melampirkan properti namepada request body.
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // nilai properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  // Bila buku berhasil dimasukkan
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // Server gagal memasukkan buku karena alasan umum (generic error)
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

// Kriteria 2 : API dapat menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
  const {
    name,
    reading,
    finished,
  } = request.query;

  let filteredBooks = books;

  if (name) {
    filteredBooks = books.filter((bName) => bName.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading) {
    filteredBooks = books.filter((book) => Number(book.reading) === Number(reading));
  }

  if (finished) {
    filteredBooks = books.filter((book) => Number(book.finished) === Number(finished));
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });

  response.code(200);
  return response;
};

// Kriteria 3 : API dapat menampilkan detail buku
const getBookByIdHandler = (request, h) => {
  const {
    id,
  } = request.params;

  // buku dengan id yang dilampirkan ditemukan
  const book = books.filter((b) => b.id === id)[0];
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  // Bila buku dengan id yang dilampirkan oleh client tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

// Kriteria 4 : API dapat mengubah data buku
const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Client tidak melampirkan properti name pada request body
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    const finished = pageCount === readPage;

    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    // Bila buku berhasil diperbarui
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
  // Id yang dilampirkan oleh client tidak ditemukkan oleh server
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

// Kriteria 5 : API dapat menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex((book) => book.id === id);

  // Bila id dimiliki oleh salah satu buku
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  // Bila id yang dilampirkan tidak dimiliki oleh buku manapun
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
