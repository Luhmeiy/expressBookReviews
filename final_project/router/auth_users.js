const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
	let userswithsamename = users.filter((user) => {
		return user.username === username;
	});

	if (userswithsamename.length > 0) {
		return true;
	} else {
		return false;
	}
};

const authenticatedUser = (username, password) => {
	let validusers = users.filter((user) => {
		return user.username === username && user.password === password;
	});

	if (validusers.length > 0) {
		return true;
	} else {
		return false;
	}
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!username) {
		return res.status(400).json({ message: "Missing username" });
	}

	if (!password) {
		return res.status(400).json({ message: "Missing password" });
	}

	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign(
			{
				data: password,
			},
			"access",
			{ expiresIn: 60 * 60 }
		);

		req.session.authorization = {
			accessToken,
			username,
		};

		return res.status(200).json({ message: `User ${username} logged in` });
	} else {
		return res.status(400).json({ message: "Invalid Login" });
	}
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const review = req.body.review;
	const username = req.session.authorization.username;

	let isReviewed;

	for (let [key, review] of Object.entries(books[isbn].reviews)) {
		if (review.username === username) {
			isReviewed = key;
		}
	}

	if (isReviewed) {
		books[isbn].reviews[isReviewed] = {
			review,
			username,
		};
	} else {
		const number = Object.keys(books[isbn].reviews).length + 1;

		books[isbn].reviews = {
			...books[isbn].reviews,
			...{ [number]: { review, username } },
		};
	}

	return res
		.status(200)
		.json({ message: `Review '${review}' posted by user ${username}` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization.username;

	for (let [key, review] of Object.entries(books[isbn].reviews)) {
		if (review.username === username) {
			delete books[isbn].reviews[key];

			return res.status(200).json({ message: "Review deleted" });
		}
	}

	return res.status(400).json({ message: "Review not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
