const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const db = require('../db'); // Database connection
//ROUTE 1 :-Get all the notes using GET "api/note/fetchnotes" login required

router.get("/fetchAllNotes", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id; 
    const notes = await db.manyOrNone('SELECT id, title, description , tag FROM notes WHERE user_id = $1',[userId]);
    res.json(notes);

  }
  //catch error
  catch (error) {
    console.log(error.message)
    res.status(500).send("Internal error occurred")
  }
});

//ROUTE 2 :-Add notes using POST "api/note/addnote" login required

router.post(
  "/addNote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 10 characters").isLength({ min: 10 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const userId = req.user.id; 
      const newNotes = await db.one(
        'INSERT INTO notes (title, description, tag, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, tag, userId]
      );
      res.json(newNotes)
    }  //catch error
    catch (error) {
      console.log(error.message)
      res.status(500).send("Internal error occurred")
    }
  }
);


//ROUTE 3 :-Update notes using PUT "api/note/updatenote" login required

router.put(
  "/updateNote/:id",
  fetchUser,
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //Create a newnote object
      const newNote = {};
      if (title) { newNote.title = title };
      if (description) { newNote.description = description };
      if (tag) { newNote.tag = tag };

      //Find the note to be updated 
      const noteId = req.params.id;
      let note = await db.oneOrNone('SELECT * FROM notes WHERE id = $1',[noteId]);
      // Checking for user
      console.log(note.user_id.toString())
      console.log( req.user.id)
      if (note.user_id !== req.user.id) {
        return res.status(401).send("Not Allowed")
      }

      // checking for specific note id
      if (!note) {
        return res.status(404).send("Not Found")
      }

      // updating the notes
      const updatedNote = await db.oneOrNone(
        'UPDATE notes SET title = $1, description = $2, tag = $3 WHERE id = $4 RETURNING *',
        [newNote.title, newNote.description, newNote.tag, req.params.id]
      );
      res.send({ updatedNote })
    }  //catch error
    catch (error) {
      console.log(error.message)
      res.status(500).send("Internal Server error occurred")
    }
  }
);


//ROUTE 4 :-Delete notes using delete "api/note/deletenote" login required

router.delete(
  "/deleteNote/:id",
  fetchUser,
  async (req, res) => {
    try {

      //Find the note to be deleted 
      const noteId = req.params.id;
      let note = await db.oneOrNone('SELECT * FROM notes WHERE id = $1',[noteId]);
      // Checking for user
      if (note.user_id !== req.user.id) {
        return res.status(401).send("Not Allowed")
      }

      // checking for specific note id
      if (!note) {
        return res.status(404).send("Not Found")
      }

      // delete the notes
      const deletedNote = await db.oneOrNone(
        'DELETE FROM notes WHERE id = $1 RETURNING *',
        [req.params.id]
      );
      //RETURNING * clause returns the deleted row after the deletion 
      res.send({ "sucess": "successfully delete the notes", note: deletedNote })
    }  //catch error
    catch (error) {
      console.log(error.message)/
      res.status(500).send("Internal Server error occurred")
    }
  }
);
module.exports = router;
