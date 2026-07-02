const ReaderService = require("../services/reader.service"); // Hãy chắc chắn tên file service của bạn là reader.service.js hoặc readers.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new Reader
exports.create = async (req, res, next) => {
  if (
    !req.body?.firstName ||
    !req.body?.lastName ||
    !req.body?.birthDay ||
    !req.body?.gender ||
    !req.body?.address ||
    !req.body?.phone
  ) {
    return next(new ApiError(400, "Borrower name cannot be empty"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the reader record"),
    );
  }
};

// Retrieve all readers from the database
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const readerService = new ReaderService(MongoDB.client);
    const { name } = req.query; // Tìm kiếm theo query string: ?name=xxx
    if (name) {
      documents = await readerService.findByName(name);
    } else {
      documents = await readerService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving reader records"),
    );
  }

  return res.send(documents);
};

// Find a single reader with an id
exports.findOne = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Reader record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving reader record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a reader by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Reader record not found"));
    }
    return res.send({ message: "Reader record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating reader record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete a reader with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Reader record not found"));
    }
    return res.send({ message: "Reader record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete reader record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete all readers from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const deletedCount = await readerService.deleteAll();
    return res.send({
      message: `${deletedCount} reader records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all reader records"),
    );
  }
};
