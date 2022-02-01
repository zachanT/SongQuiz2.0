import React, { useState, useEffect } from 'react'
import WebPlayback from './WebPlayback'
import Display from './Display'
import Playlist from './Playlist'
import {Timer} from './Timer'
/**
 * Resources:
 * How to play a playlist - https://community.spotify.com/t5/Spotify-for-Developers/API-is-there-a-way-to-start-playing-a-playlist-from-a-specific/td-p/4976711
 * Tut for React game -  https://www.youtube.com/watch?v=EPh_VbMxu4E
 * String similarity library - https://www.npmjs.com/package/string-similarity
 */

const LISTEN_TIME = 10000 
const NUM_ROUNDS = 2

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ],
    duration: 0,
    position: 0,
}

const Main = (props) => {

    const [player, setPlayer] = useState(undefined)
    const updatePlayer = (update) => {
        setPlayer(update)
        console.log(update)
    }

    const [current_track, setTrack] = useState(track);
    const updateTrack = (update) => {
        console.log("UPDATING TRACK")
        console.log("pos " + update.position)
        console.log(update)
        const newTrack = {
            name: update.name,
            album: update.album,
            artists: update.artists,
            duration: update.duration,
            position: update.position,
        }
        setTrack(newTrack)
        console.log(current_track)
    }

    const [is_paused, setPaused] = useState(true);
    const updatePause = (paused) => {
        setPaused(paused)
    }

    const [is_active, setActive] = useState(false);

    const [competitors, setCompetitors] = useState([])

    const [whoseTurn, setTurn] = useState(0)
    const [round, setRound] = useState(-1)
    const [display, setDisplay] = useState("Hello there! Hope you enjoy the game! :)")
    const [outOfTime, setOutOfTime] = useState(false)
    const [inGame, setInGame] = useState(false)
    const [readyToPlay, setReadyToPlay] = useState(false)
    const [input, setInput] = useState("")
    const [guessing, setGuessing] = useState(false)
    const [playlists, setPlaylists] = useState([])
    const [playlistsData, setPlaylistsData] = useState([])
    
    /**
     * Handles error caused by access_token expiring. Sends a request to get a new access_token
     * with the refresh_token.
     * 
     * @param {json} err
     * @return {Promise<boolean>} JSON
     */
    const handleAPIError = async(err) => {
        console.log("Error: " + err.status + ": " + err.message)
        if(err.status === 401 && err.message === 'The access token expired') {
            const response = await fetch('/auth/refresh_token?refresh_token=' + props.refresh_token)
            let data = await response.json()
            console.log("Returned from /refresh_token")
            console.log(data)
            props.updateToken(data.access_token)
            return true
        }
        return false
    }

    /**
     * Send's an API request to the url with the given options. If an error occurs from the API
     * request, calls a function to handle it then resends the API request.
     * 
     * @param {string} url 
     * @param {json} options
     * @returns {Promise<string>} JSON
     */
    const sendAPIReq = async(url, options) => {
        console.log("Sending new req!") 
        const response = await fetch(url, options)
        let data = await response.text()
        data = data ? JSON.parse(data) : {}
        if(data.error !== null && data.error !== undefined) {            
            const result = await handleAPIError(data.error)
            if(result) {
                sendAPIReq(url, options)
            }
        }
        return data

    }

    /**
     * Function to check input against actual track name & artist. Adds points to correct competitor and
     * skips to next track.
     * 
     * @param {*} e 
     */
    const handleSubmit = (e) => {
        e.preventDefault()
        setGuessing(false)
        setDisplay("")
        document.getElementById('form-container').style.display = 'none'

        console.log("Whose turn? : " + whoseTurn)
        console.log("Answer: " + input)

        checkAnswer()

        setTimeout(() => {
            setDisplay("")
            nextSong()
            document.getElementById('form-container').style.display = 'block'
        }, 7500)
    }

    /**
     * Function name
     */
    const checkAnswer = () => {
        let guess = input.toLowerCase().replace(/['.?!]/g, '')

        let currCompetitor = {
            id: whoseTurn,
            points: competitors[whoseTurn].points
        }

        let possibleAns = []

        // Check song name
        let correctName = false
        console.log("Track: " + current_track.name.toLowerCase().replace(/['.?!]/g, '') + " artist: " + current_track.artists[0].name.toLowerCase())
        console.log("Input: " + guess)

        possibleAns.push(current_track.name.toLowerCase().replace(/['.?!]/g, ''))
        let ind = current_track.name.indexOf('(') - 1;
        console.log(ind)
        if(ind > 0) {
            possibleAns.push(current_track.name.substring(0, ind).toLowerCase().replace(/['.?!]/g, ''))
        }

        console.log(possibleAns.length)
        for(let i = 0; i < possibleAns.length; ++i) {
            console.log("Possibility: " + possibleAns[i])
            if(guess.includes(possibleAns[i])) {
                correctName = true
                currCompetitor.points += 10
                break
            }
        }
        

        // Check if guess contains any correct artist
        let correctArtist = false
        for(let i = 0; i < current_track.artists.length; ++i) {
            if(guess.includes(current_track.artists[i].name.toLowerCase())) {
                currCompetitor.points += 10
                correctArtist = true
                break
            }
        }

        // Update score for current competitor
        let updatedCompetitors =  competitors
        updatedCompetitors.splice(whoseTurn, 1, currCompetitor)
        setCompetitors(updatedCompetitors)
        console.log("Scores: ")
        console.log(competitors)
        setInput("")

        if(correctName && correctArtist)
            setDisplay("You guessed the name and artist correct!")
        else if(correctName)
            setDisplay("You got the name correct!")
        else if(correctArtist)
            setDisplay("You got the artist correct!")
        else
            setDisplay("Incorrect answer")

        setTimeout(function() {setDisplay("The song was " + current_track.name + " by " + current_track.artists[0].name)}, 3000)
    }

    /**
     * Play the current track at a random position for LISTEN_TIME before pausing again
     */
    const playRandPos = () => {
        // player.seek(generateRandTime(current_track.duration))
        console.log("Playing " + current_track.name + " at position: " + current_track.position)
        setDisplay("Listen to the song...")
        player.seek(current_track.position)
        setGuessing(false)
        player.resume()
        setTimeout(function() {
            setDisplay("")
            player.pause()
            setGuessing(true)
        }, 
        LISTEN_TIME)
    }

    /**
     * Starts next song at random location also updates turn and round counter if necessary
     */
    const nextSong = () => {
        // Only play next song if in a game
        if(!inGame) return

        setTurn((whoseTurn + 1) % competitors.length)
        if(whoseTurn >= competitors.length-1) {
            setTurn(0)
            setRound(round + 1)
            if(round === NUM_ROUNDS) {
                endGame()
            } else {
                console.log("New Round: " + round)
                player.nextTrack().then(() => {
                    setDisplay("Listen to the song...")
                    setReadyToPlay(true)
                })
            }
        } else {
            player.nextTrack().then(() => {
                setDisplay("Listen to the song...")
                setReadyToPlay(true)
            })
        }
    }

    const displayWelcome = () => {
        setDisplay("Welcome to Song Quiz 2.0!\
        Listen to the song then guess the name and artist")
    }

    /**
     * Initialize all state variables to start a new game. Asks user for num of competitors.
     * Shows selection of playlists from users spotify account.
     */
    const newGame = () => {
        // Check that spotify web player is connected
        if(!is_active) {
            alert("Please select Song Quiz 2.0 as the connected device")
            return
        }

        const options = {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + props.token }
        }

        sendAPIReq('https://api.spotify.com/v1/me/player/shuffle?state=true', options)
        
        setDisplay("")
        setRound(0)
        competitors.splice(0, competitors.length)
        setCompetitors([])
        document.getElementById('start-btn').className = 'hidden'

        // Ask user for number of players and initialize competitors
        let num = -1
        while(num < 1 || num > 4) {
            num = prompt("How many players (1-4)")
        }
        console.log("players: " + num)
        for(let i = 0; i < num; ++i) {
            const newCompetitor = {
                id: i,
                points: 0
            }
            competitors.push(newCompetitor)
            setCompetitors(competitors)
        }
        console.log("Competitors initialized: ")
        console.log(competitors)

        // Make this a callback or something to wait for the user to select a playlist
        setDisplay("Select a playlist to play from!")
        getUsersPlaylists()
    }

    /**
     * Logic to start the game
     */
    const startGame = () => {
        displayWelcome()
        setTurn(0)
        setRound(1)

        setTimeout(()=> {
            setReadyToPlay(true)
            setInGame(true)
            setPlaylistsData([])
            setDisplay("Listen to the song...")
        }, 6000)
    }

    /**
     * Ends the current game. Calculates the winner and stops next song from playing.
     */
    const endGame = () => {
        player.pause()
        setInGame(false)
        document.getElementById('start-btn').className = 'btn-spotify'
        let winner = {
            id: -1,
            points: -1,
        }
        let winners = []
        for(let i = 0; i < competitors.length; ++i) {
            if(competitors[i].points > winner.points) {
                winner.id = competitors[i].id
                winner.points = competitors[i].points
            } else if(competitors[i].points === winner.points) {
                winners.push(1 + competitors[i].id)
            }
        }
        winners.push(1 + winner.id)
        
        console.log(winners)

        if(winners.length > 1) {
            let str = "Player "
            for(let i = 0; i < winners.length; ++i) {
                if(i === winners.length - 2) {
                    str += winners[winners.length-2]
                } else if (i === winners.length - 1){
                    str += " and " + winners[winners.length-1] + " "
                } else {
                    str += (winners[i] + ", ")
                }
            }
            str += "tied for 1st with " + winner.points + " points!"

            alert(str)
        } else {
            alert("Player " + (winner.id+1) + " won with " + winner.points + " points!")
        }

        setDisplay("Play another game?")
    }

    /**
     * Handles when a playlist component is clicked. Sends an API request to play the clicked playlist
     * @param {json} playlist 
     */
    const playlistClicked = async (playlist) => {
        console.log("Selected - ")
        console.log(playlist)
        let body = {
            context_uri: playlist.uri
        }
        const options = {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + props.token },
            body: JSON.stringify(body)
        };

        await sendAPIReq('https://api.spotify.com/v1/me/player/play', options)

        const reqOptions = {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + props.token }
        }
        await sendAPIReq('https://api.spotify.com/v1/me/player/pause', reqOptions)
        startGame()
        setPlaylistsData([])
    }

    /**
     * Gets the list of playlists from Spotify API.
     */
    const getUsersPlaylists = async () => {
        const options = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + props.token },
        }

        console.log("Before")
        let data = await sendAPIReq('https://api.spotify.com/v1/me/playlists', options)
        console.log("Returned")
        console.log(data)
        setPlaylistsData(data.items)
    }

    /**
     * Creates playlist components for each playlist.
     */
    const showPlaylists = () => {
        const playlistsComp = []
        setPlaylists([])
        for(let i = 0; i < playlistsData.length; ++i) {
            let playlist = <Playlist key={i} id={playlistsData[i].id} handleClick={playlistClicked} playlist={playlistsData[i]} />
            playlistsComp.push(playlist)
        }
        
        setPlaylists(playlistsComp)
    }

    useEffect(() => {
        showPlaylists()
    }, [playlistsData])

    useEffect(() => {
        console.log("Time ran out")
        if(inGame && is_paused && guessing) {
            setDisplay("Out of time!")
            setGuessing(false)
            setTimeout(() => checkAnswer(), 1500)

            setTimeout(() => nextSong(), 9000)
        }
    }, [outOfTime])

    useEffect(() => {
        if(readyToPlay && inGame) {
            playRandPos()
            setReadyToPlay(false)
        }
    }, [inGame])

    useEffect(() => {
        if(readyToPlay) {
            playRandPos()
            setReadyToPlay(false)
        }
    }, [current_track])

    return (
        <>
            {!inGame ? 
            <div className='header'>
                <button className='btn-spotify' onClick={()=> props.updateToken('')}>Logout</button>
            </div>
            :<></>}
            <Display display={display} />
            <div className='container'>
                {!inGame ? <button id='start-btn' className='btn-spotify' onClick={() => {newGame()}}>Start Game</button> : <></>}
            </div>
            <div className='playlists'>
                { playlists }
            </div>

            {(guessing) ? 
            <div>
                <Timer setOutOfTime={setOutOfTime} whoseTurn={whoseTurn} is_paused={is_paused} inGame={inGame} guessing={guessing} />
                <div className='container'>
                <div id='form-container'>
                    <form className='input' autoComplete='off' onSubmit={handleSubmit}>
                        <input type="text" className='input_field' autoComplete='nope' name="guess" id="guess" placeholder='Guess the song and artist!' value={input} onChange={(e) => setInput(e.target.value)}/>
                        <label htmlFor="guess" className='input_label'>Guess the song and artist!</label>
                        <input className='btn-spotify' id='submitGuess' type="submit" />
                        <button className='btn-spotify' id='repeat' onClick={() => playRandPos()} >Repeat</button>
                    </form>
                </div>
                </div>
                <div className='container'>
                    
                </div>
            </div>
            : <></>}

            <WebPlayback token={props.token} player={player} onUpdate={updatePlayer} current_track={current_track} updateTrack={updateTrack} onTogglePlay={updatePause}
                         inGame={inGame} is_active={is_active} setActive={setActive} guessing={guessing} repeat={playRandPos} sendAPIReq={sendAPIReq} />
        </>
    )
}

export default Main

/*TODO:
-Maybe add option to logout :)
    -When would we show it? Before starting a game only? During a game? What happens if you log out while ingame?

DONE:
+New game after finishing a game completely scuffed?
+Display playlists that you can select from
+If timer runs out for current song, timer instantly runs out for next song
+Ties aren't handled at all
+Hide "Start Game" button after clicking
+Repeat song
+Pause player when playlist selected
+Repeat plays from a diff position from when it was originally played
+Setup some simple algo to accept answers close enough to actual answer (might just use similarity library to do this)
    -Change numbers to letter if possible
    -Special characters changed out with normal letters
    -[It is really really simple, could improve it in future iterations]
+If token is expired for any API call, use refresh_token to get access
*/