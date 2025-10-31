// src/components/EmployeeDetails.js




import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";






function EmployeeDetails() {
 const { id } = useParams(); // Get the ID from the URL
 const navigate = useNavigate();
 const [employee, setEmployee] = useState(null);




 useEffect(() => {
   // Fetch employee data based on the ID (use your API instead of this dummy data)
   const employeeData = employeeDetails.find((emp) => emp.id === parseInt(id));
   setEmployee(employeeData);
 }, [id]);




 const handleBack = () => {
   navigate("/employee"); // Navigate back to the employee list
 };




 if (!employee) {
   return <div>Loading...</div>;
 }




 return (
   <div>
     <h2>Employee Details</h2>
     <p><strong>Employee ID:</strong> {employee.id}</p>
     <p><strong>Employee Name:</strong> {employee.name}</p>
     <p><strong>Email:</strong> {employee.email}</p>
     <p><strong>Status:</strong> {employee.status}</p>
     <button onClick={handleBack}>Back to Employee List</button>
   </div>
 );
}




export default EmployeeDetails;
