const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser'); // Middleware for user authentication
const { body, validationResult } = require("express-validator");
const db = require('../db'); // Database connection

const JWT_SECRET = "secretforthejwttoken"; // Secret for JWT token

// ROUTE 1: Create a user using POST "/api/auth/createUser"
router.post(
  "/createUser",
  [
    // Validation checks for name, email, and password
    body("name", "Enter a valid Name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password","Enter a valid Password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { name, email, password } = req.body;

    try {
      const userExists = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists) {
        return res.status(400).json({ error: "Email already exists" }); // Return error if email exists
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user record into the database
      const newUser = await db.one(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );

      const data = { user: { id: newUser.id } };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken }); // Return authentication token
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error occurred"); // Return internal server error
    }
  }
);

// ROUTE 2: Login a user using POST "/api/auth/login"
router.post(
  "/loginUser",
  [
    // Validation checks for email and password
    body("email", "Enter a valid Email").isEmail(),
    body("password").exists(),
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { email, password } = req.body;

    try {
      let success = false;
      const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
      if (!user) {
        return res.status(400).json({ error: "Incorrect email or password" }); // Return error if user doesn't exist
      }

      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare) {
        return res.status(400).json({ error: "Incorrect email or password" }); // Return error if password is incorrect
      }

      // Data assigning when logging 
      const data = { user: { id:user.id } };
      const authToken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({ success, authToken }); // Return success and authentication token
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error occurred"); // Return internal server error
    }
  }
);

// ROUTE 3: Get user detail who just logged in using GET "/api/auth/getuser" (login required)
router.get("/getUser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id; 
    // Retrieve user details from the database
    const user = await db.oneOrNone('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    res.json(user); // Return user details
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error occurred"); // Return internal server error
  }
});

module.exports = router;
