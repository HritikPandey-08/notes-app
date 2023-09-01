import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
  //host of backend
  const host = process.env.REACT_APP_HOST_URL;
  const initialNotes = [];
  const [notes, setNotes] = useState(initialNotes);
  //Get all notes
  const getNotes = async ()=> {
    const response = await fetch(`${host}/api/notes/fetchAllNotes`, {
      method: "GET",// Metgod of fetch
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token'),
      },
    });
    const json = await response.json();
    setNotes(json)

  }
  //Add note
  const addNote = async (title, description, tag)=>{
    const response = await fetch(`${host}/api/notes/addNote`, {
      method: "POST",// Method of add
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token'),
      },
      body : JSON.stringify({title, description, tag})
    });
    const data = await response.json()
    setNotes(notes.concat(data))
  }
  //Update note
  const editNote = async (id, title, description, tag) => {
    //API Call 
    const response = await fetch(`${host}/api/notes/updateNote/${id}`, {
      method: "PUT",// Method of fetch
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token'),
      },
      body : JSON.stringify({title, description, tag})
    });
    const json = await response.json();
    console.log(json)
    let newNotes = JSON.parse(JSON.stringify(notes))

    for(let index = 0; index < newNotes.length; index++)
    {
      const element = newNotes[index];
      if(element.id === id)
      {
        newNotes[index].title = title;
        newNotes[index].description = description;
        newNotes[index].tag = tag;
        break;
      }
    }
    setNotes(newNotes);
    
  }
  //Delete note
  const deleteNote = async (id)=>{

    const response = await fetch(`${host}/api/notes/deleteNote/${id}`, {
      method: "DELETE",// Metgod of fetch
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
        "auth-token":localStorage.getItem('token'),
      },
    });
    console.log(response)
    const newNote = notes.filter((note)=>{
      return note.id!==id
      
    })
    setNotes(newNote);
  }
  
  return (
    <NoteContext.Provider value={{ notes, addNote,editNote,deleteNote,getNotes }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
