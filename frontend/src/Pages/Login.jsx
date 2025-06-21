import React, { useState } from 'react';
import Notification from '../Components/Notification';
import { useLocation, useNavigate } from 'react-router-dom';

function Login({ setUsername, setToken, setRole, setCookie }) {
    const [error, setError] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [notificationContent, setNotificationContent] = useState("");
    const [notificationType, setNotificationType] = useState("error");
    const location = useLocation();
    const navigate = useNavigate();

    const handleLoginClick = () => setIsLogin(true);
    const handleSignupClick = () => setIsLogin(false);
    const handleForgotPasswordClick = () => alert("Not yet implemented");

    const showError = (message, type = "error") => {
        setNotificationContent(message);
        setNotificationType(type);
        setError(true);
        setTimeout(() => setError(null), 3500);
    };

    const handleLogin = async () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            return showError("Please fill out all fields");
        }

        try {
            const res = await fetch(`/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.status === 200) {
                const { username, token, role } = await res.json();
                setRole(role);
                setUsername(username);
                setToken(token);
                setCookie(token, role, username);
                navigate('/', {
                    state: {
                        from: location,
                        toast: {
                            message: "Successfully logged in as " + username,
                            type: "success",
                        }
                    },
                    replace: true
                });
            } else if (res.status === 400) {
                showError("Invalid username or password");
            } else {
                showError("Internal Server Error");
            }
        } catch (err) {
            console.error("Error:", err);
            showError("Network error");
        }
    };

    const handleRegister = async () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!username || !password || !confirmPassword) {
            return showError("Please fill out all fields");
        }

        if (password !== confirmPassword) {
            return showError("Passwords do not match");
        }

        try {
            const res = await fetch(`/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.status === 200) {
                showError("Account created successfully", "success");
                setIsLogin(true);
            } else if (res.status === 400) {
                showError("User already exists");
            } else {
                showError("Internal Server Error");
            }
        } catch (err) {
            console.error("Error:", err);
            showError("Network error");
        }
    };

    return (
        <div className='flex h-screen'>
            {error && (
                <Notification
                    notificationContent={notificationContent}
                    notificationType={notificationType}
                />
            )}
            <div className="bg-slate-700 m-auto sm:w-1/2 w-full border-2 border-slate-700 rounded-lg p-5">
                <h1 className="text-4xl text-slate-100 pt-5">PlayerJR</h1>
                <div className="flex justify-center items-stretch relative flex-row">
                    <div className={`w-72 max-w-[45%] h-14 rounded-l-3xl rounded-r-3xl bg-yellow-500 absolute border-solid z-0 transition-transform ${isLogin ? `translate-x-[-50%]` : `translate-x-[50%]`}`}></div>
                    <button className="w-72 max-w-[45%] h-14 rounded-l-3xl bg-opacity-20 bg-white text-black text-lg font-semibold z-10" onClick={handleLoginClick}>Login</button>
                    <button className="w-72 max-w-[45%] h-14 rounded-r-3xl bg-opacity-20 bg-white text-black text-lg font-semibold z-10" onClick={handleSignupClick}>Signup</button>
                </div>
                {isLogin ? (
                    <div className='flex flex-col pt-10'>
                        <p className="text-2xl text-slate-300">Login</p>
                        <label className="text-slate-300">Username</label>
                        <input className='bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" id="username" />
                        <label className="text-slate-300">Password</label>
                        <input className='bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="password" id="password" />
                        <p className="text-sm text-slate-300 hover:text-blue-400 cursor-pointer pt-2 pb-2" onClick={handleForgotPasswordClick}>Forgot Password?</p>
                        <button className="bg-slate-500 text-slate-100 rounded-lg p-3 font-bold" onClick={handleLogin}>Login</button>
                    </div>
                ) : (
                    <div className='flex flex-col pt-10'>
                        <p className="text-2xl text-slate-300">Signup</p>
                        <label className="text-slate-300">Username</label>
                        <input className='bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="text" id="username" />
                        <label className="text-slate-300">Password</label>
                        <input className='bg-slate-900 text-white rounded-md h-9 text-lg p-2' type="password" id="password" />
                        <label className="text-slate-300">Confirm Password</label>
                        <input className='bg-slate-900 text-white rounded-md h-9 text-lg p-2 mb-2' type="password" id="confirmPassword" />
                        <button className="bg-slate-500 text-slate-100 rounded-lg p-3 font-bold" onClick={handleRegister}>Signup</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
