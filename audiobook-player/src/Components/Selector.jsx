import React, { useState, useEffect } from 'react';
import Player from './Player';

function Selector({ setSelectedTrack, setSelectedAlbum, selectedTrack, setNotificationContent, setNotificationType, setHeaderPresent, selectedAlbum, token, removeCookie}) {
    const [allAlbums, setAllAlbums] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            return new Promise((resolve, reject) => {
                fetch(`${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_FRONT_END_PORT}/api/albums`, {
                    headers: {
                        Authorization: `${token}`
                    }
                })
                    .then((response) => {
                        if (response.status === 401) {
                            removeCookie();
                            alert("Session Expired. Please log in again.");
                        }
                        return response.json();
                    })
                    .then((data) => resolve(data))
                    .catch((error) => reject(error));
            });
        };

        fetchData()
            .then((data) => setAllAlbums(data))
            .catch((error) => console.error(error));
    }, [token, removeCookie]);

    const handleAlbumClick = (album) => {
        if (selectedAlbum === album.Id) {
            return;
        }
        setSelectedTrack(null);
        setSelectedAlbum(album.Id);
        fetch(`${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_FRONT_END_PORT}/api/album?album=${album.Id}`, {
            headers: {
            Authorization: `${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => setSelectedTrack(data));
    }

    return (
        <div className="flex flex-wrap justify-center bg-inherit pt-16 pb-16 z-0">
            {allAlbums.length > 0 ? (allAlbums.map((album) =>
                <div key={album.id} onClick={() => handleAlbumClick(album)} className={`relative m-5 flex w-48 max-w-xs flex-col overflow-hidden rounded-lg transition-colors ${selectedAlbum === album.Id ? "border-amber-700 bg-amber-600": "border-slate-600 bg-slate-700"} shadow-md transform transition-transform ease-in hover:scale-105`}>
                    <button className="relative mx-3 mt-3 flex h-40 overflow-hidden rounded-xl">
                    <img className="object-cover self-center" src={album.Link ? album.Link : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} alt="Album Cover" />
                    </button>
                    <div className="mt-4 px-5 pb-5">
                        <h5 className="text-xl tracking-tight text-slate-100">{album.Album}</h5>
                        <h5 className="text-m tracking-tight text-slate-300">{album.Artist}</h5>
                    </div>
                </div>
            )) : <h1 className="text-3xl text-slate-100 pt-32">No Albums Found</h1>}
            {selectedTrack ? 
            <Player 
                selectedTrack={selectedTrack} 
                setNotificationContent={setNotificationContent} 
                setNotificationType={setNotificationType} 
                setHeaderPresent={setHeaderPresent}
                currentBookId={selectedAlbum}
                token={token} 
            /> : null}
        </div>
    );
}

export default Selector;
