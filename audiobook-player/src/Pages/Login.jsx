import React, { useState } from 'react';
import Notification from '../Components/Notification';
import { useNavigate } from 'react-router-dom';

function Login({setUsername, setToken, setRole}) {
    const navigate = useNavigate();
    const [error, setError] = useState(null); 
    const [isLogin, setIsLogin] = useState(true);
    const [notificationContent , setNotificationContent] = useState("test");
    const [notificationType, setNotificationType] = useState("error");

    setTimeout(() => setError(false), 3500);

    const handleLoginClick = () => {
        setIsLogin(true);
    };

    const handleSignupClick = () => {
        setIsLogin(false);
    };

    const handleForgotPasswordClick = () => {
        alert("too bad lol");
    
    };

    const handleLogin = () => {
        if (document.getElementById("username").value === "" || document.getElementById("password").value === "") {
            setNotificationContent("Please fill out all fields");
            setNotificationType("error");
            setError(true);
            return;
        }
        fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            })
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else if (res.status === 400) {
                setNotificationContent("Invalid username or password");
                setNotificationType("error");
                setError(true);
            } else {
                setNotificationContent("Internal Server Error");
                setNotificationType("error");
                setError(true);
            }
        }).then(data => {
            const { username, token, role } = data;
            setRole(role);
            setUsername(username);
            setToken(token);
            navigate("/");
        }).catch(error => {
            console.error("Error:", error);
        });
    };

    const handleRegister = () => {
        if (document.getElementById("username").value === "" || document.getElementById("password").value === "" || document.getElementById("confirmPassword").value === "") {
            setNotificationContent("Please fill out all fields");
            setNotificationType("error");
            setError(true);
            return;
        }
        if (document.getElementById("password").value !== document.getElementById("confirmPassword").value) {
            setNotificationContent("Passwords do not match");
            setNotificationType("error");
            setError(true);
            return;
        }
        fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            })
        }).then(res => {
            if (res.status === 200) {
                setNotificationContent("Account created successfully");
                setNotificationType("success");
                setError(true);
            } else if (res.status === 400) {
                setNotificationContent("User already exists");
                setNotificationType("error");
                setError(true);
            } else {
                setNotificationContent("Internal Server Error");
                setNotificationType("error");
                setError(true);
            }
    }
    )}


    return (
        <div>
            {error ? <Notification notificationContent={notificationContent} notificationType={notificationType}></Notification> : null }
            <div className={`bg-inherit m-auto h-4/5 shadow-slate-500 border-2 border-slate-700 rounded-lg p-5 bg-slate-700 mt-[5%] sm:ml-32 sm:mr-32`}>
                <h1 className="text-4xl text-slate-100 pt-5">PlayerJR</h1>
                <div className="flex justify-center items-stretch relative flex-row">
                    <div className={`w-72 max-w-[45%] h-14 rounded-l-3xl rounded-r-3xl bg-yellow-500 absolute border-solid z-0 transition-transform ${isLogin ? `translate-x-[-50%]` : `translate-x-[50%]`}`}></div>
                    <button className="w-72 max-w-[45%] h-14 rounded-l-3xl bg-opacity-20 bg-white text-black text-lg font-semibold z-10 border-solid" onClick={handleLoginClick}>Login</button>
                    <button className="w-72 max-w-[45%] h-14 rounded-r-3xl bg-opacity-20 bg-white text-black text-lg font-semibold z-10 border-solid" onClick={handleSignupClick}>Signup</button>
                </div>
                {isLogin ? <div className='flex flex-col pt-10'>
                    <p className="text-2xl text-slate-300">Login</p>
                    <p className="text-slate-300">Username</p>
                    <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" name="username" id="username" />
                    <p className="text-slate-300">Password</p>
                    <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="password" name="password" id="password" />
                    <p className="text-slate-300 text-sm hover:text-blue-400 cursor-pointer pt-2 pb-2" onClick={handleForgotPasswordClick}>Forgot Password?</p>
                    <button className="bg-slate-500 text-slate-100 rounded-lg p-3 font-bold" onClick={handleLogin}>Login</button>
                </div>:
                <div className='flex flex-col pt-10'>
                    <p className="text-2xl text-slate-300">Signup</p>
                    <p className="text-slate-300">Username</p>
                    <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" name="username" id="username" />
                    <p className="text-slate-300">Password</p>
                    <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="password" name="password" id="password" />
                    <p className="text-slate-300">Confirm Password</p>
                    <input className='w-full bg-slate-900 text-white rounded-md h-9 text-lg p-2 mb-2' type="password" name="password" id="confirmPassword" />
                    <button className="bg-slate-500 text-slate-100 rounded-lg p-3 font-bold" onClick={handleRegister}>Signup</button>
                
                </div>}

            </div>
        </div>
        
    );
}

export default Login;
