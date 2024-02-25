import React, { useState } from 'react';
function Notification({ notificationContent, notificationType, headerPresent }) {
const [isVisible, setIsVisible] = useState(true);
if (isVisible) {
    setTimeout(() => setIsVisible(false), 4000);
}
return (
        <div className={`absolute p-3 duration-500 font-bold text-xl w-full transition-opacity ease-out z-20
        ${notificationType === 'error' ? 'bg-red-500' : 
            notificationType === 'success' ? 'bg-green-500' : 
            notificationType=== 'warning' ? 'bg-yellow-500' : null} 
        ${isVisible ? 'opacity-100' : 'opacity-0' } 
        ${headerPresent ? 'top-16' : 'top-0'}`}>
            <p>{notificationContent}</p>
        </div>
    );
}

export default Notification;
