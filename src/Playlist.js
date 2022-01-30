

const Playlist = ({ playlist, handleClick }) => {
    return (
        <div className="playlist" onClick={() => {handleClick(playlist)}} >
            <img className="playlist-img" src={playlist.images[0].url} alt='' />
            {playlist.name.length > 30 ?
            <a>{playlist.name.substring(0, 30) + '...'}</a> :
            <a>{playlist.name}</a>}
        </div>
    )
}



export default Playlist
