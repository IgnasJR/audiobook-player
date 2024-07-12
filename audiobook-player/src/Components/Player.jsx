import "../index.css";
import ReactAudioPlayer from 'react-audio-player';
import React, { useEffect, useRef, useState } from "react";

function Player({ selectedTrack, setNotificationContent, setNotificationType, setHeaderPresent, token, currentBookId }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const progressValueRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(audioRef.current?.isPlaying);
  const [queuePosition, setQueuePosition] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    const fetchAudio = async () => {
      if (selectedTrack && selectedTrack[queuePosition]) {
        const trackID = selectedTrack[queuePosition].ID;
        const url = `${window.location.protocol}//${window.location.hostname}:3001/api/retrieve?id=${trackID}`;
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `${token}`
            }
          });
          if (response.ok) {
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            setAudioSrc(objectURL);
          } else {
            console.error('Failed to fetch audio:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching audio:', error);
        }
      } else {
        setAudioSrc(null);
      }
    };

    fetchAudio();

    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [selectedTrack, queuePosition, token]);

  useEffect(() => {
    const saveTrackProgress = () => {
      if (isPlaying && token != null) {
        fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/saveTrackProgress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify({
            BookId: currentBookId,
            Track: queuePosition,
            Progress: audioRef.current.audioEl.current.currentTime
          })
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setNotificationContent(data.error);
            setNotificationType('warning');
            setHeaderPresent(true);
          }
        });
      }
    };

    const interval = setInterval(saveTrackProgress, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, selectedTrack, queuePosition, setNotificationContent, setNotificationType, setHeaderPresent, currentBookId]);

  useEffect(() => {
    const audioElement = audioRef.current.audioEl.current;
    audioElement.volume = volume;
    const handleTimeUpdate = () => {
      const duration = audioElement.duration;
      if (!isNaN(duration) && isFinite(duration)) {
        const progress = (audioElement.currentTime / duration) * 100;
        progressValueRef.current.style.width = `${progress}%`;
      } else {
        progressValueRef.current.style.width = `0% !important`;
      }
    };
    const handlePlay = () => { setIsPlaying(true); };
    const handlePause = () => { setIsPlaying(false); };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
    };
  }, [volume, progressRef, audioRef, selectedTrack, queuePosition, isPlaying]);

  const playPauseToggle = () => {
    try {
      if (!selectedTrack) {
        return;
      }
      const audioElement = audioRef.current.audioEl.current;
      if (isPlaying && !audioElement.paused) {
        audioElement.pause();
      } else if (!isPlaying && audioElement.paused) {
        audioElement.play();
      }
    } catch (error) {
      console.log(error);
      setNotificationContent('Error playing track');
      setNotificationType('warning');
      setHeaderPresent(true);
    }
  };

  const handleNextInQueue = () => {
    if (!selectedTrack) {
      return;
    }
    if (queuePosition < selectedTrack.length - 1){
      setQueuePosition(queuePosition + 1);
    }
    audioRef.current.audioEl.current.pause();
    setAudioTime(0);
  };

  const handlePreviousInQueue = () => {
    if (!selectedTrack) {
      return;
    }
    if (queuePosition > 0){
      setQueuePosition(queuePosition - 1);
    }
    audioRef.current.audioEl.current.pause();
    setAudioTime(0);
  };

  const handleProgressClick = (e) => {
    if (!selectedTrack) {
      return;
    }
    try {
      const audioElement = audioRef.current.audioEl.current;
      const progressElement = progressRef.current;
      const clickPosition = e.pageX - progressElement.getBoundingClientRect().left;
      const percentage = clickPosition / progressElement.offsetWidth;
      const newTime = percentage * audioElement.duration;
      setAudioTime(newTime);
    } catch (error) {
      console.log(error);
    }
  };

  const setAudioTime = (time) => {
    try {
      const audioElement = audioRef.current.audioEl.current;
      audioElement.currentTime = time;
    } catch (error) {
      console.log(error);
    }
  };

  const handleVolumeChange = (e) => {
    try {
      const audioElement = audioRef.current.audioEl.current;
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      audioElement.volume = newVolume;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='fixed bottom-0 w-full h-[4.5rem] bg-slate-700 z-10'>
      <ReactAudioPlayer
        src={audioSrc}
        autoPlay
        type="audio/mpeg"
        onEnded={handleNextInQueue}
        ref={audioRef}
      />
      <div className='controls pt-2'>
        <input className="absolute right-2 top-1/4 max-w-3xl h-2 mb-6 bg-slate-400 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 invisible sm:visible" type="range" id="volume" name="volume" min="0" max="1" step="0.01" onChange={handleVolumeChange}/>
        <svg xmlns="http://www.w3.org/2000/svg" onClick={handlePreviousInQueue} className="pl-4 pr-4" padd height='5vh' viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg>
        <svg onClick={playPauseToggle} xmlns="http://www.w3.org/2000/svg" height='5vh' viewBox="0 0 384 512">{isPlaying? <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/> : <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>}</svg>
        <svg xmlns="http://www.w3.org/2000/svg" onClick={handleNextInQueue} className="pl-4 pr-4" height='5vh' viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg>
      </div>
      <div className="song-metadata absolute left-2 top-1 flow-root text-left">
        <h1 className="text-slate-50 text-m">{selectedTrack ? selectedTrack[queuePosition].FileName.split('.')[0] : ''}</h1>
        <h1 className="text-slate-300 text-sm">{selectedTrack ? selectedTrack[queuePosition].Artist : ''}</h1>
      </div>
      <div className="w-full fixed bottom-0 bg-gray-200 rounded-full h-2.5 dark:bg-gray-600" ref={progressRef} onClick={handleProgressClick}>
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-100 hover:cursor-pointer" style={{width:0}} ref={progressValueRef}></div>
      </div>
    </div>
  );
}

export default Player;
