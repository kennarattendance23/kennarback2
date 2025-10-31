import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Report.css";

const Report = () => {
  const [logs, setLogs] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newTimeIn, setNewTimeIn] = useState("");
  const [newTimeOut, setNewTimeOut] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const API_URL = "https://kennarbackend.onrender.com/api/attendance";

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(API_URL);
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
    }
  };

  const handleSearch = () => {
    if (!fromDate && !toDate) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter((log) => {
      const logDate = new Date(log.date);
      const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
      const to = toDate ? new Date(toDate + "T23:59:59") : null;
      return (!from || logDate >= from) && (!to || logDate <= to);
    });

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHTML = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; text-align: center; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { background: #59a5f0; }
            td { background: #b3d9ff; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Attendance Report</h2>
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>EMPLOYEE ID</th>
                <th>FULLNAME</th>
                <th>TEMPERATURE</th>
                <th>STATUS</th>
                <th>TIME-IN</th>
                <th>TIME-OUT</th>
                <th>NO. OF HOURS</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs
                .map(
                  (log) => `
                    <tr>
                      <td>${new Date(log.date).toLocaleDateString("en-US")}</td>
                      <td>${log.employee_id}</td>
                      <td>${log.fullname}</td>
                      <td>${log.temperature || "-"}</td>
                      <td>${log.status || "-"}</td>
                      <td>${log.time_in || "-"}</td>
                      <td>${log.time_out || "-"}</td>
                      <td>${log.working_hours || "-"}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setNewTimeIn(currentItems[index].time_in || "");
    setNewTimeOut(currentItems[index].time_out || "");
  };

  const handleCancelClick = () => {
    setEditingIndex(null);
    setNewTimeIn("");
    setNewTimeOut("");
  };

  const handleSaveClick = async (index) => {
    const updatedLogs = [...filteredLogs];
    const globalIndex = indexOfFirstItem + index;
    updatedLogs[globalIndex].time_in = newTimeIn;
    updatedLogs[globalIndex].time_out = newTimeOut;

    let workingHours = null;
    if (newTimeIn && newTimeOut) {
      const [inH, inM] = newTimeIn.split(":").map(Number);
      const [outH, outM] = newTimeOut.split(":").map(Number);
      let hours = outH - inH;
      let minutes = outM - inM;
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      workingHours = (hours + minutes / 60).toFixed(2);
      updatedLogs[globalIndex].working_hours = workingHours;
    }

    try {
      await axios.put(
        `${API_URL}/${updatedLogs[globalIndex].attendance_id}`,
        {
          time_in: newTimeIn,
          time_out: newTimeOut,
          working_hours: workingHours,
        }
      );

      setFilteredLogs(updatedLogs);
      setEditingIndex(null);
      setNewTimeIn("");
      setNewTimeOut("");
    } catch (error) {
      console.error("❌ Failed to save changes:", error);
      alert("Failed to save changes to the database");
    }
  };

  return (
    <div className="report-scroll-wrapper">
      <div className="report-container">
        <h3 className="report-header">Attendance Logs</h3>

        <div className="report-controls">
          <label>Show from</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span>To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
          <button
            className="search-button"
            onClick={() => setFilteredLogs(logs)}
          >
            Show All
          </button>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>EMPLOYEE ID</th>
              <th>FULLNAME</th>
              <th>TEMPERATURE</th>
              <th>STATUS</th>
              <th>TIME-IN</th>
              <th>TIME-OUT</th>
              <th>NO. OF HOURS</th>
              <th className="no-print">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((log, idx) => (
                <tr key={idx}>
                  <td>{new Date(log.date).toLocaleDateString("en-US")}</td>
                  <td>{log.employee_id}</td>
                  <td>{log.fullname}</td>
                  <td>{log.temperature || "-"}</td>
                  <td>{log.status || "-"}</td>
                  <td>
                    {editingIndex === idx ? (
                      <input
                        type="time"
                        value={newTimeIn}
                        onChange={(e) => setNewTimeIn(e.target.value)}
                        step="60"
                      />
                    ) : log.time_in ? (
                      log.time_in.slice(0, 5)
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {editingIndex === idx ? (
                      <input
                        type="time"
                        value={newTimeOut}
                        onChange={(e) => setNewTimeOut(e.target.value)}
                        step="60"
                      />
                    ) : log.time_out ? (
                      log.time_out.slice(0, 5)
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{log.working_hours || "-"}</td>
                  <td className="no-print">
                    {editingIndex === idx ? (
                      <>
                        <button
                          className="save-btn"
                          onClick={() => handleSaveClick(idx)}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={handleCancelClick}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(idx)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No records found</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination-print-wrapper no-print">
          <div className="entries-info">
            {totalPages > 0
              ? `Showing ${currentPage} of ${totalPages}`
              : "No pages to display"}
          </div>

          <div className="buttons-group">
            <button className="print-button" onClick={handlePrint}>
              Print
            </button>
            <button
              className="page-buttonP"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span className="page-number">{currentPage}</span>
            <button
              className="page-buttonN"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
