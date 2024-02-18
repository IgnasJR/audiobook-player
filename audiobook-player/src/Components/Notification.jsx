function Notification({notificationContent, notificationType}){
    return(
        <div className={`absolute top-0  transition delay-700 p-3 duration-300 ease-in-out w-[100%] ${notificationType === 'error'? 'bg-red-500' : 'bg-yellow-400'}`}>
            <p>{notificationContent}</p>
        </div>
    );
}
export default Notification;