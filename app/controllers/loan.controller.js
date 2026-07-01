const LoanService = require("../services/loan.service"); // Hãy chắc chắn tên file service của bạn là loan.service.js hoặc loans.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new Loan
exports.create = async (req, res, next) => {
  if (!req.body?.borrowerName) {
    return next(new ApiError(400, "Borrower name cannot be empty"));
  }

  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the loan record"),
    );
  }
};

// Retrieve all loans from the database
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const loanService = new LoanService(MongoDB.client);
    const { name } = req.query; // Tìm kiếm theo query string: ?name=xxx
    if (name) {
      documents = await loanService.findByName(name);
    } else {
      documents = await loanService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving loan records"),
    );
  }

  return res.send(documents);
};

// Find a single loan with an id
exports.findOne = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Loan record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving loan record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a loan by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Loan record not found"));
    }
    return res.send({ message: "Loan record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating loan record with id=${req.params.id}`),
    );
  }
};

// Delete a loan with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Loan record not found"));
    }
    return res.send({ message: "Loan record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete loan record with id=${req.params.id}`,
      ),
    );
  }
};

// Find all loans that are already returned
exports.findAllReturned = async (_req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const documents = await loanService.findisReturned(); // Gọi chính xác hàm findisReturned() trong Service của bạn
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving returned loans"),
    );
  }
};

// Delete all loans from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const deletedCount = await loanService.deleteAll();
    return res.send({
      message: `${deletedCount} loan records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all loan records"),
    );
  }
};
