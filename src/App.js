import React, { useState, useEffect } from 'react';
import Main from './Main';
import Login from './Login'
import './App.css';

/**
 * TODO:
 * -Implement speech to text library
 * -Frontend cleanup. Make it pretty.
 * 
 * Completed: 
 * xCreate input component for guessing
 * xCheck guess against song name/artist
 * xSong seeks to random location and plays for set num of secs
 * xCountdown timer after song pauses
 * xScoring system and win condition
 * xSelect certain spotify playlist to start the game from (maybe be able to select from an actual interface within the app)
 */

function App() {

  const [token, setToken] = useState('');
  const [refresh_token, setRefresh_token] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
      setRefresh_token(json.refresh_token)
    }

    getToken();

  }, []);

  return (
    <>
        { (token === '') ? <Login/> : <Main token={token} refresh_token={refresh_token} updateToken={setToken} /> }
    </>
  );
}

export default App;