import React from 'react'

export const Login = () => {
    return (
        <div className="App">
            <header className='App-header'>
                <div className='container'>
                    <h1>
                        Song Quiz 2.0
                    </h1>
                </div>
                <a className='btn-spotify' href='/auth/login'>
                    Login with Spotify
                </a>
            </header>
        </div>
    )
}

export default Login;