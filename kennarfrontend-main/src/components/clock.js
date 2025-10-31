import React, { useEffect, useState } from "react";


function Clock() {
 const [time, setTime] = useState(new Date());



 useEffect(() => {
   const timer = setInterval(() => setTime(new Date()), 1000);
   return () => clearInterval(timer);
 }, []);




 return (
   <div className="w-64 h-64 rounded-full border-8 border-black flex items-center justify-center text-2xl bg-white shadow-lg">
     {time.toLocaleTimeString()}
   </div>
 );
}


export default Clock;
