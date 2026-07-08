const BookService = require("../services/book.service"); // Hãy chắc chắn tên file service của bạn là book.service.js hoặc books.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new Book
exports.create = async (req, res, next) => {
  if (
    !req.body?.name ||
    !req.body?.auth ||
    !req.body?.description ||
    !req.body?.category ||
    !req.body?.imgUrl
    // !req.body?.quantity
    // !req.body?.year
  ) {
    return next(new ApiError(400, "Borrower name cannot be empty"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the book record"),
    );
  }
};

// Retrieve all books from the database
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const bookService = new BookService(MongoDB.client);
    const { name } = req.query; // Tìm kiếm theo query string: ?name=xxx
    if (name) {
      documents = await bookService.findByName(name);
    } else {
      documents = await bookService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving book records"),
    );
  }

  return res.send(documents);
};

// Find a single book with an id
exports.findOne = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Book record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving book record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a book by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Book record not found"));
    }
    return res.send({ message: "Book record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating book record with id=${req.params.id}`),
    );
  }
};

// Delete a book with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Book record not found"));
    }
    return res.send({ message: "Book record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete book record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete all books from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const deletedCount = await bookService.deleteAll();
    return res.send({
      message: `${deletedCount} book records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all book records"),
    );
  }
};
