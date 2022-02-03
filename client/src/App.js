import React, { useState, useEffect } from 'react';
import Main from './Main';
import Login from './Login'
import './App.css';

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