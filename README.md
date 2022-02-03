# Song Quiz 2.0

Simple game that plays a snippet of a random song and has the player guess the name and artist! 

[Play it here!](https://song-quiz-2.herokuapp.com/home)

## Key Features
- Login with Spotify Account
- Automatically switches web browser for Spotify playback
- Display users playlists
- Play random song from selected playlist
- Plays song for set amount of time
- Guess countdown timer
- Simple answer checking
- Scoring system for song name & artist(s) name correct
- Automatically refreshes Spotify access token if an API returns an error stating the token has expired

## Technology used
Game built primarily with React and uses Node.js & Express for the backend. It also makes calls to the Spotify Web API and uses the Web Playback SDK. 

## Possible future plans
- Implement Speech to text library so that players can speak their guesses
- Improve frontend layout and styling
- Add settings page to allow players to customize duration that song plays for, time given to guess, and other customizations
    - Or add difficulty options which would have preset guess time etc.