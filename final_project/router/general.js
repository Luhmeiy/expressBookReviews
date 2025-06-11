const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!username) {
		return res.status(400).json({ message: "Missing username" });
	}

	if (!password) {
		return res.status(400).json({ message: "Missing password" });
	}

	if (!isValid(username)) {
		users.push({ username: username, password: password });

		return res
			.status(200)
			.json({ message: `Registered new user ${username}` });
	} else {
		return res.status(400).json({ message: "User already registered" });
	}
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
	new Promise((resolve, reject) => {
		try {
			const books = require("./booksdb.js");
			resolve(books);
		} catch (error) {
			reject(error);
		}
	})
		.then((booksData) => {
			return res.status(200).send(booksData);
		})
		.catch((error) => {
			console.error("Error loading books:", error);
			return res.status(500).send("Error loading books");
		});
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	const isbn = req.params.isbn;

	if (isbn) {
		new Promise((resolve, reject) => {
			try {
				const books = require("./booksdb.js");
				resolve(books);
			} catch (error) {
				reject(error);
			}
		})
			.then((booksData) => {
				const book = booksData[isbn];
				return res.status(200).send(book);
			})
			.catch((error) => {
				console.error("Error loading book:", error);
				return res.status(500).send("Error loading book");
			});
	}
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
	const author = req.params.author;
	const authorBooks = [];

	new Promise((resolve, reject) => {
		try {
			const books = require("./booksdb.js");
			resolve(books);
		} catch (error) {
			reject(error);
		}
	})
		.then((booksData) => {
			for (let book of Object.values(booksData)) {
				if (book.author === author) {
					authorBooks.push(book);
				}
			}

			return res.status(200).send(authorBooks);
		})
		.catch((error) => {
			console.error("Error loading books:", error);
			return res.status(500).send("Error loading books");
		});
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
	const title = req.params.title;
	let selectedBook;

	new Promise((resolve, reject) => {
		try {
			const books = require("./booksdb.js");
			resolve(books);
		} catch (error) {
			reject(error);
		}
	})
		.then((booksData) => {
			for (let book of Object.values(booksData)) {
				if (book.title === title) {
					selectedBook = book;
				}
			}

			return res.status(200).json(selectedBook);
		})
		.catch((error) => {
			console.error("Error loading books:", error);
			return res.status(500).send("Error loading books");
		});
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	const isbn = req.params.isbn;

	if (isbn) {
		const book = books[isbn];
		return res.status(200).json(book.reviews);
	}
});

module.exports.general = public_users;
