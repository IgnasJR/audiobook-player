import React, { useState } from 'react';
import Header from '../Components/Header';
import Notification from '../Components/Notification';
import Loading from '../Components/Loading';

function AddBook({ token, username, role, setToken, setUsername, setRole, removeCookie }) {
  const [error, setError] = useState(null);
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const clearNotification = () => {
    setNotificationContent("");
    setNotificationType("");
  };

  const UploadFiles = () => {
    if (isLoading) return;
    setIsLoading(true);
    if (!document.getElementById('album').value ||
        !document.getElementById('artist').value ||
        !document.getElementById('fileInput').files.length) {
      
      setNotificationContent("Please fill out all fields");
      setNotificationType("warning");
      setError(true);
      setIsLoading(false);
      return;
    }
    
    const albumInput = document.getElementById('album').value;
    const artistInput = document.getElementById('artist').value;
    const coverArtLinkInput = document.getElementById('cover').value;
    const fileInput = document.getElementById('fileInput').files;

    const formData = new FormData();
    formData.append('album', albumInput);
    formData.append('artist', artistInput);
    formData.append('coverArtLink', coverArtLinkInput);
    
    for (let i = 0; i < fileInput.length; i++) {
      formData.append('files', fileInput[i]);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_FRONT_END_PORT}/api/upload`, true);
    xhr.setRequestHeader('Authorization', `${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };
    xhr.onload = () => {
      setIsLoading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        setNotificationContent(xhr.responseText);
        setNotificationType("success");
        setError(false);
      } else {
        setNotificationContent(xhr.responseText || "Upload failed");
        setNotificationType("error");
        setError(true);
      }
    };
    xhr.onerror = () => {
      setIsLoading(false);
      setNotificationContent("Network error");
      setNotificationType("error");
      setError(true);
    };
    xhr.send(formData);
  };

  return (
    <div className="bg-inherit pt-16 w-full flex justify-center">
      {isLoading && <Loading />}
      <Header token={token} setToken={setToken} username={username} setUsername={setUsername} role={role} setRole={setRole} removeCookie={removeCookie} />
      {notificationContent && (
        <Notification 
          notificationContent={notificationContent} 
          notificationType={notificationType} 
          headerPresent={true}
          clearNotification={clearNotification}
        />
      )}
      <div className='bg-inherit m-auto h-4/5 shadow-slate-500 border-2 border-slate-700 rounded-lg p-5 bg-slate-700 mt-[5%] sm:ml-32 sm:mr-32 sm:w-1/2'>                    
        <p className="text-4xl text-slate-300 pb-4">Add an audiobook</p>
        <p className="text-slate-300">Album name</p>
        <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" id="album" />
        <p className="text-slate-300">Artist</p>
        <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" id="artist" />
        <p className="text-slate-300">Album cover</p>
        <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="url" id="cover" />
        <p className="text-slate-300">Contents</p>
        <input className="block w-full text-sm text-white rounded-lg cursor-pointer bg-slate-900" multiple type="file" id="fileInput" />
        <button className="bg-slate-500 text-slate-100 rounded-lg p-3 font-bold mt-5 pl-6 pr-6" disabled={isLoading} onClick={UploadFiles}>Upload</button>
        {uploadProgress > 0 && (
          <div className="relative pt-1 mt-4">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-black bg-green-500">
                {uploadProgress}%
              </div>
            </div>
            <div className="flex flex-col">
              <div className="relative flex flex-col justify-center">
                <div className="flex-auto bg-gray-300 h-2 rounded">
                  <div className="bg-green-500 h-full rounded" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>            
    </div>
  );
}
export default AddBook;