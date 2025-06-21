import { React, useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Player from '../Components/Player';

const ViewAlbum = ({ token }) => {
    const { id } = useParams();
    const [notificationContent, setNotificationContent] = useState(""); // for future notification handling
    const [notificationType, setNotificationType] = useState("error");
    const [headerPresent, setHeaderPresent] = useState(false);
    const [isAlbumSelected, setIsAlbumSelected] = useState(false);
    const [album, setAlbum] = useState(null);

    const originalProgress = useRef({ progress: 0, track: null });
    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const response = await fetch(`/api/album?album=${id}`, {
                    headers: {
                        Authorization: `${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setAlbum(data);
                    }
                }
            } catch (error) {
                console.error(error);
                setAlbum(null);
            }
        };
    
        fetchAlbum();
    }, [id, token]);
    

    useEffect(() => {
        if (album) {
            originalProgress.current = { progress: album.trackProgress || 0, track: album.track || null };
        }
    }, [album]);

    const setSelectedTrack = (index) => {
        let progress = originalProgress.current.progress;
        console.log(originalProgress.current);

        if (originalProgress.current.track !== index) progress = 0;

        setAlbum(prevAlbum => ({
            ...prevAlbum,
            track: index,
            trackProgress: progress
        }));

        setIsAlbumSelected(true);
    };
 return (
        <div className='h-[100vh] content-center text-white'>
            {album ? (
                <div className='flex flex-wrap justify-center bg-inherit md:pt-16 pt-5 md:pb-16 pb-28 z-0 text-white'>
                    <div className='flex flex-col items-center'>
                        <img src={album.coverArtLink} alt="Album Cover" className='md:w-[30vw] w-[80vw] rounded-xl mb-6' />
                        <h1 className='text-4xl'>{album.albumName}</h1>
                        <h1 className='text-2xl'>{album.artist}</h1>
                        <button onClick={() => setIsAlbumSelected(true)} className='px-16 py-4 hover:bg-amber-600 bg-slate-700 rounded-xl mt-4 ' >{(album.track === 0 && album.trackProgress === 0)? 'Start ' : 'Continue'}</button>
                    </div>
                    <ul className='md:w-1/4 w-3/4 md:ml-5 overflow-y-auto md:h-[80vh]'>
                        {album.tracks.map((track, index) => (
                            <li className='rounded-md border-black border bg-slate-700 hover:transition-colors hover:bg-amber-600 m-1' key={track.id} onClick={() => setSelectedTrack(index)}>
                                <div className='flex p-3 items-center'>
                                    <h3>{track.fileName}</h3>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <h1 className='text-3xl text-center'>Album not found</h1>
            )}
            {isAlbumSelected && (
                <Player
                    selectedAlbum={album}
                    setNotificationContent={setNotificationContent}
                    setNotificationType={setNotificationType}
                    setHeaderPresent={setHeaderPresent}
                    currentAlbumId={id}
                    token={token}
                />
            )}
        </div>
    );
};

export default ViewAlbum;
