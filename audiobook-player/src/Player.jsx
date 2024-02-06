import "./index.css";
import React, { useEffect, useRef, useState } from "react";

function Player({ onTimeUpdate, selectedTrack }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioElement = audioRef.current;

    const handleTimeUpdate = () => {
      const progress = (audioElement.currentTime / audioElement.duration) * 100;
      progressRef.current.value = progress;

      if (onTimeUpdate) {
        onTimeUpdate(audioElement.currentTime, audioElement.duration);
      }
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [onTimeUpdate, audioRef, selectedTrack]);

  const playPauseToggle = () => {
    const audioElement = audioRef.current;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().then(() => {
        if (!isPlaying) {
          setIsPlaying(true);
        }
      });
    }

    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audioElement = audioRef.current;
    const progressElement = progressRef.current;
    const clickPosition = e.pageX - progressElement.getBoundingClientRect().left;
    const percentage = clickPosition / progressElement.offsetWidth;
    const newTime = percentage * audioElement.duration;
    audioElement.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const audioElement = audioRef.current;
    audioElement.volume = e.target.value;
  }

  return (
    <div className='player'>
      <audio id='audio' ref={audioRef} src={`${window.location.protocol}//${window.location.hostname}:3001/api/retrieve?id=${selectedTrack}`}
  />
      <div className='controls'>
      <input className="w-full h-2 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" type="range" id="volume" name="volume" min="0" max="1" step="0.01" onChange={handleVolumeChange}/>
        <svg onClick={playPauseToggle} xmlns="http://www.w3.org/2000/svg" height='7vh' viewBox="0 0 384 512">{isPlaying? <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/> : <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>}</svg>
      </div>
      <div>
        <progress
          ref={progressRef}
          id="progress"
          value='0'
          max="100"
          onClick={handleProgressClick}
        ></progress>
      </div>
    </div>
  );
}

export default Player;
