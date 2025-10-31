import React from "react";

function StatBox({ label, value }) {
 return (
   <div className="bg-white p-4 rounded shadow-md text-center">
     <div className="text-xl font-bold">{value}</div>
     <div className="mt-2 text-gray-600">{label}</div>
   </div>
 );
}

export default StatBox;


