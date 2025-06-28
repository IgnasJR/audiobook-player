import "../index.css";
import ReactAudioPlayer from "react-audio-player";
import React, { useEffect, useRef, useState } from "react";

function Player({
  selectedAlbum,
  setNotificationContent,
  setNotificationType,
  setHeaderPresent,
  token,
  currentAlbumId,
}) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const progressValueRef = useRef(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioSrc, setAudioSrc] = useState(null);

  useEffect(() => {
    const fetchAudio = async () => {
      if (selectedAlbum) {
        await setQueuePosition(selectedAlbum.track);
        try {
          const response = await fetch(
            `/api/retrieve?id=${selectedAlbum.tracks[queuePosition].id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
          if (response.ok) {
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            setAudioSrc(objectURL);
          } else {
            console.error("Failed to fetch audio:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching audio:", error);
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
  }, [selectedAlbum, queuePosition, token]);

  useEffect(() => {
    if (audioRef.current && selectedAlbum) {
      const setTime = () => {
        if (audioRef.current && audioRef.current.audioEl.current) {
          audioRef.current.audioEl.current.currentTime =
            selectedAlbum.trackProgress;
        }
      };
      const audioElement = audioRef.current
        ? audioRef.current.audioEl.current
        : null;
      if (audioElement) {
        audioElement.addEventListener("loadedmetadata", setTime);
      }

      return () => {
        if (audioElement) {
          audioElement.removeEventListener("loadedmetadata", setTime);
        }
      };
    }
  }, [audioSrc, selectedAlbum]);

  useEffect(() => {
    const saveTrackProgress = () => {
      if (
        isPlaying &&
        token != null &&
        audioRef.current &&
        audioRef.current.audioEl.current
      ) {
        fetch(`/api/saveTrackProgress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            bookId: currentAlbumId.toString(),
            track: queuePosition.toString(),
            progress: audioRef.current.audioEl.current.currentTime.toString(),
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              setNotificationContent(data.error);
              setNotificationType("warning");
              setHeaderPresent(true);
            }
          });
      }
    };

    const interval = setInterval(saveTrackProgress, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [
    isPlaying,
    selectedAlbum,
    queuePosition,
    setNotificationContent,
    setNotificationType,
    setHeaderPresent,
    currentAlbumId,
  ]);

  useEffect(() => {
    const audioElement = audioRef.current
      ? audioRef.current.audioEl.current
      : null;
    if (audioElement) {
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
      const handlePlay = () => {
        setIsPlaying(true);
      };
      const handlePause = () => {
        setIsPlaying(false);
      };

      audioElement.addEventListener("timeupdate", handleTimeUpdate);
      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("pause", handlePause);

      return () => {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("pause", handlePause);
      };
    }
  }, [volume, progressRef, audioRef, selectedAlbum, queuePosition]);

  const playPauseToggle = () => {
    try {
      if (!selectedAlbum || !audioRef.current) {
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
      setNotificationContent("Error playing track");
      setNotificationType("warning");
      setHeaderPresent(true);
    }
  };

  const handleNextInQueue = () => {
    if (!selectedAlbum || !audioRef.current) {
      return;
    }
    if (queuePosition < selectedAlbum.length - 1) {
      setQueuePosition(queuePosition + 1);
    }
    audioRef.current.audioEl.current.pause();
    setAudioTime(0);
  };

  const handlePreviousInQueue = () => {
    if (!selectedAlbum || !audioRef.current) {
      return;
    }
    if (queuePosition > 0) {
      setQueuePosition(queuePosition - 1);
    }
    audioRef.current.audioEl.current.pause();
    setAudioTime(0);
  };

  const handleProgressClick = (e) => {
    if (!selectedAlbum || !audioRef.current) {
      return;
    }
    try {
      const audioElement = audioRef.current.audioEl.current;
      const progressElement = progressRef.current;
      const clickPosition =
        e.pageX - progressElement.getBoundingClientRect().left;
      const percentage = clickPosition / progressElement.offsetWidth;
      const newTime = percentage * audioElement.duration;
      setAudioTime(newTime);
    } catch (error) {
      console.log(error);
    }
  };

  const setAudioTime = (time) => {
    try {
      if (audioRef.current && audioRef.current.audioEl.current) {
        const audioElement = audioRef.current.audioEl.current;
        audioElement.currentTime = time;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVolumeChange = (e) => {
    try {
      if (audioRef.current && audioRef.current.audioEl.current) {
        const audioElement = audioRef.current.audioEl.current;
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioElement.volume = newVolume;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed bottom-0 w-full bg-slate-700 z-50 sm:h-20 h-28">
      <ReactAudioPlayer
        src={audioSrc}
        autoPlay
        type="audio/mpeg"
        onEnded={handleNextInQueue}
        ref={audioRef}
      />

      <div className="absolute left-4 top-2 text-left">
        <h1 className="text-white text-sm sm:text-base font-medium truncate max-w-xs">
          {selectedAlbum ? selectedAlbum.tracks[queuePosition].fileName : ""}
        </h1>
        <h2 className="text-slate-300 text-xs sm:text-sm truncate max-w-xs">
          {selectedAlbum ? selectedAlbum.artist : ""}
        </h2>
      </div>

      <div className="flex justify-center items-center sm:pt-3 pt-10">
        <button onClick={handlePreviousInQueue} className="mx-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 320 512"
            fill="white"
          >
            <path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z" />
          </svg>
        </button>

        <button onClick={playPauseToggle} className="mx-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="32"
            viewBox="0 0 384 512"
            fill="white"
          >
            {isPlaying ? (
              <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
            ) : (
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
            )}
          </svg>
        </button>

        <button onClick={handleNextInQueue} className="mx-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 320 512"
            fill="white"
          >
            <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z" />
          </svg>
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={handleVolumeChange}
          className="ml-4 w-24 sm:block hidden"
        />
      </div>

      <div
        className="absolute bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-600 h-2.5"
        ref={progressRef}
        onClick={handleProgressClick}
      >
        <div
          className="bg-blue-600 h-2.5 transition-all duration-100 rounded-full hover:cursor-pointer"
          style={{ width: 0 }}
          ref={progressValueRef}
        />
      </div>
    </div>
  );
}

export default Player;
