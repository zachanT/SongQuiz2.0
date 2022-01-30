import React, { useEffect } from 'react'

const LISTEN_TIME = 10000

const generateRandTime = (length) => {
    console.log("Length: " + length)
    return Math.floor(Math.random() * (length - LISTEN_TIME))
}

const WebPlayback = (props) => {

    let prevPlaying = {
        id: -1,
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

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
    
        document.body.appendChild(script);
    
        window.onSpotifyWebPlaybackSDKReady = async () => {
    
            const player = new window.Spotify.Player({
                name: 'Song Quiz 2.0',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            props.onUpdate(player)
    
            // setPlayer(player);
    
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                const options = {
                    method: 'PUT',
                    headers: { 'Authorization': 'Bearer ' + props.token },
                    body: JSON.stringify({
                        device_ids: [
                            device_id
                        ],
                        play: false
                    })
                }
                props.sendAPIReq('https://api.spotify.com/v1/me/player', options)
            });
    
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
    
            player.addListener('player_state_changed', ( state => {
                if (!state) {
                    return
                }

                const newTrack = {
                    id: state.track_window.current_track.id,
                    name: state.track_window.current_track.name,
                    album: state.track_window.current_track.album,
                    artists: state.track_window.current_track.artists,
                    duration: state.duration,
                    position: 0,
                }

                // Only updates track if it is a new track
                if(newTrack.name !== prevPlaying.name || newTrack.artists[0].name !== prevPlaying.artists[0].name) {
                    newTrack.position = generateRandTime(state.duration)

                    prevPlaying.id = newTrack.id
                    prevPlaying.name = newTrack.name
                    prevPlaying.album = newTrack.album
                    prevPlaying.artists = newTrack.artists
                    prevPlaying.duration = newTrack.duration
                    prevPlaying.position = newTrack.position

                    props.updateTrack(newTrack)
                }
                props.onTogglePlay(state.paused)

                player.getCurrentState().then( state => {
                    if (!state) {
                        props.setActive(false)
                    }else { 
                        props.setActive(true)
                    }
                })
            }))

            player.connect();
        };
    }, []);

    return (
        <>
            {props.guessing ? <div className='container'>
                <div className='main-wrapper'>
                    {/*No longer display stuff here*/}
                </div>
            </div>
            : <></>
            }
        </>
    )
}

export default WebPlayback
