const CategoryService = require("../services/category.service"); // Hãy chắc chắn tên file service của bạn là category.service.js hoặc categories.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Create and Save a new Category
exports.create = async (req, res, next) => {
  if (!req.body?.name || !req.body?.description) {
    return next(new ApiError(400, "name đan address cannot be empty"));
  }

  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the category record"),
    );
  }
};

// Retrieve all categories from the database
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const categoryService = new CategoryService(MongoDB.client);
    const { name } = req.query; // Tìm kiếm theo query string: ?name=xxx
    if (name) {
      documents = await categoryService.findByName(name);
    } else {
      documents = await categoryService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving category records"),
    );
  }

  return res.send(documents);
};

// Find a single category with an id
exports.findOne = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Category record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving category record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a category by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Category record not found"));
    }
    return res.send({ message: "Category record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating category record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete a category with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Category record not found"));
    }
    return res.send({ message: "Category record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete category record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete all categories from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const deletedCount = await categoryService.deleteAll();
    return res.send({
      message: `${deletedCount} category records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "An error occurred while removing all category records",
      ),
    );
  }
};
