import React, { useState, useEffect } from 'react';

function Selector({ setSelectedTrack, setSelectedAlbum }) {
    const [allAlbums, setAllAlbums] = useState([]);

    useEffect(() => {
        fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/albums`)
            .then((response) => response.json())
            .then((data) => setAllAlbums(data));
    }, []);

    const handleAlbumClick = (album) => {
        setSelectedAlbum(album);
        fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/album?album=${album}`)
            .then((response) => response.json())
            .then((data) => setSelectedTrack(data));
    }

    return (
        <div className="flex flex-wrap justify-center bg-inherit pt-16 pb-16 z-0">
            {allAlbums.map((album) =>
                <div key={album.id} onClick={() => handleAlbumClick(album.Album)} className="relative m-5 flex w-48 max-w-xs flex-col overflow-hidden rounded-lg border border-slate-600 bg-slate-700 shadow-md">
                    <a className="relative mx-3 mt-3 flex h-40 overflow-hidden rounded-xl">
                        <img className="object-cover self-center" src={album.Link ? album.Link : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"}/>
                    </a>
                    <div className="mt-4 px-5 pb-5">
                        <a>
                            <h5 className="text-xl tracking-tight text-slate-100">{album.Album}</h5>
                            <h5 className="text-m tracking-tight text-slate-300">{album.Artist}</h5>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Selector;
