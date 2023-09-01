import React, { useState } from 'react'
import UserContext from './userContext';

const UserState = (props) => {
    const initialData = [];
    const [userData, setUserData] = useState(initialData);
    const host = process.env.REACT_APP_HOST_URL;
    const authUrl = process.env.REACT_APP_USER_PATH_URL;

    //Get all notes
    const getUserData = async () => {
        const response = await fetch(`${host}/${authUrl}getUser`, {
            method: "GET",// Metgod of fetch
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token'),
            },
        });
        const json = await response.json();
        setUserData(json)
    }

    const loginUser = async(email,password)=>{
        console.log(host)
        console.log(authUrl)
        const response = await fetch(`${host}/${authUrl}/loginUser`, {
            method: "POST",// Method of fetch
            headers: {
              "Content-Type": "application/json",
            },
            body : JSON.stringify({email,password})
          });
          const json = await response.json();
          return json
        //   setUserData(json)
        // console.log(json)
    }


    return (
        <div>
            <UserContext.Provider value={{ userData, getUserData, loginUser }}>
                {props.children}
            </UserContext.Provider>

        </div>
    )
}

export default UserState
