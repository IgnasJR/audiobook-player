import React, { useState } from 'react';
function Notification({ notificationContent, notificationType }) {
const [isVisible, setIsVisible] = useState(true);
setTimeout(() => setIsVisible(false), 3000);
    return (
        <div className={`absolute top-0 p-3 duration-500 font-bold text-xl w-full transition-opacity ease-out ${notificationType === 'error' ? 'bg-red-500' : 'bg-yellow-400'} ${isVisible ? 'opacity-100' : 'opacity-0' }`}>
            <p>{notificationContent}</p>
        </div>
    );
}

export default Notification;
