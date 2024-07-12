import React from 'react';
import Header from '../Components/Header';
import Notification from '../Components/Notification';
import Loading from '../Components/Loading';
import { useState } from 'react';
function AddBook({token, username, role, setToken, setUsername, setRole}){
    const [error, setError] = useState(null); 
    const [notificationContent , setNotificationContent] = React.useState("");
    const [notificationType, setNotificationType] = React.useState("");
    const [isLoading, setIsLoading] = useState();
    setTimeout (() => setError(false), 3500);

    const UploadFiles = async () => {
        if (isLoading) return;
        await setIsLoading(true);
        if (document.getElementById('album').value === "" || 
            document.getElementById('artist').value === "" || 
            document.getElementById('fileInput').count < 1) {
            
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
    
        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `${token}`
                },
                body: formData
            });
    
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }
            const data = await response.text();
            setNotificationContent(data);
            setNotificationType("success");
            setError(true);
        } catch (error) {
            setNotificationContent(error.message);
            setNotificationType("error");
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-inherit pt-16">
            {isLoading ? <Loading/> : null}
            <Header token={token} setToken={setToken} username={username} setUsername={setUsername} role={role} setRole={setRole}  />
            {error ? <Notification headerPresent = {true} notificationContent={notificationContent} notificationType={notificationType}></Notification> : null }
            <div className='bg-inherit m-auto h-4/5 shadow-slate-500 border-2 border-slate-700 rounded-lg p-5 bg-slate-700 mt-[5%] sm:ml-32 sm:mr-32'>                    
                <p className="text-4xl text-slate-300 pb-4">Add an audiobook</p>
                <p className="text-slate-300">Album name</p>
                <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" id="album" />
                <p className="text-slate-300">Artist</p>
                <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" id="artist" />
                <p className="text-slate-300">Album cover</p>
                <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="url" id="cover" />
                <p className="text-slate-300">Contents</p>
                <input class="block w-full text-sm text-white rounded-lg cursor-pointer bg-slate-900" multiple type="file" id="fileInput"/>
                <button className="bg-slate-500 text-slate-100 rounded-lg p-3 font-bold mt-5 pl-6 pr-6" disabled={isLoading} onClick={UploadFiles}>Upload</button>
            </div>            
        </div>
    );
}
export default AddBook;