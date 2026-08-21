const express = require("express");
const books = require("../controllers/book.controller");
const upload = require('../middlewares/upload');
const router = express.Router();

router.route("/").get(books.findAll).post(upload.single('image'), books.create).delete(books.deleteAll);
router.route("/:id").get(books.findOne).put(upload.single('image'), books.update).delete(books.delete);

module.exports = router;
