import React, { useState } from 'react';
import Notification from '../Components/Notification';

function Login({setIsAuthenticated}) {
    const [error, setError] = useState(null); 
    const [isLogin, setIsLogin] = useState(true);
    const [notificationContent , setNotificationContent] = useState("test");
    const [notificationType, setNotificationType] = useState("error");

    setTimeout(() => setError(false), 4000);

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
        if (document.getElementById("email").value === "" || document.getElementById("password").value === "") {
            setNotificationContent("Please fill out all fields");
            setNotificationType("error");
            setError(true);
            return;
        }
        setIsAuthenticated(true);
    };


    return (
        <div>
            {error ? <Notification notificationContent={notificationContent} notificationType={notificationType}></Notification> : null }
            <div className={`bg-inherit m-auto h-4/5 shadow-slate-500 border-2 border-slate-700 rounded-lg p-5 bg-slate-700 mt-[5%] sm:ml-16 sm:mr-16`}>
                <h1 className="text-4xl text-slate-100 pt-5">PlayerJR</h1>
                <div className="flex justify-center items-stretch relative flex-row">
                    <div className={`w-72 max-w-[45%] h-14 rounded-l-3xl rounded-r-3xl bg-yellow-500 absolute border-solid z-0 transition-transform ${isLogin ? `translate-x-[-50%]` : `translate-x-[50%]`}`}></div>
                    <button className="w-72 max-w-[45%] h-14 rounded-l-3xl bg-opacity-20 bg-white text-black text-lg font-semibold z-10 border-solid" onClick={handleLoginClick}>Login</button>
                    <button className="w-72 max-w-[45%] h-14 rounded-r-3xl bg-opacity-20 bg-white text-black text-lg font-semibold z-10 border-solid" onClick={handleSignupClick}>Signup</button>
                </div>
                {isLogin ? <div className='flex flex-col pt-10'>
                    <p className="text-2xl text-slate-300">Login</p>
                    <p className="text-slate-300">Email</p>
                    <input className='w-full bg-slate-400 rounded-md h-7' type="email" name="email" id="email" />
                    <p className="text-slate-300">Password</p>
                    <input className='w-full bg-slate-400 rounded-md h-7' type="password" name="password" id="password" />
                    <p className="text-sm hover:text-blue-300 cursor-pointer pt-2 pb-2" onClick={handleForgotPasswordClick}>Forgot Password?</p>
                    <button className="bg-slate-500 text-slate-100 rounded-lg p-2" onClick={handleLogin}>Login</button>
                </div>:
                <div>


                </div>}

            </div>
        </div>
        
    );
}

export default Login;
