// routes/Dashboard.js
import express from "express";
import pool from "../config/database.js";  // default import

const router = express.Router();

// ✅ Helper function: Get today's date in local timezone (Philippines UTC+8)
function getTodayDate() {
  const now = new Date();
  // convert to UTC+8
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; 
  const localTime = new Date(utc + 8 * 3600000); // UTC+8
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ Dashboard stats endpoint
router.get("/dashboard-stats", async (req, res) => {
  const today = req.query.date || getTodayDate();

  try {
    const [
      [employeesRows],
      [presentRows],
      [lateRows],
      [absentRows],
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM employees WHERE status = 'Active'`),


      pool.query(
        `SELECT COUNT(DISTINCT employee_id) AS total
         FROM attendance
         WHERE (status = 'Present' OR status = 'Late') AND date = ?`,
        [today]
      ),
      

      pool.query(
        `SELECT COUNT(DISTINCT employee_id) AS total
         FROM attendance
         WHERE status = 'Late' AND date = ?`,
        [today]
      ),

      pool.query(
        `SELECT COUNT(*) AS total
         FROM employees
         WHERE status = 'Active'
         AND employee_id NOT IN (
           SELECT employee_id FROM attendance WHERE date = ?
         )`,
        [today]
      ),
    ]);

    const employees = employeesRows[0].total || 0;
    const present = presentRows[0].total || 0;
    const late = lateRows[0].total || 0;
    const absent = absentRows[0].total || 0;

    console.log("📊 Dashboard Stats:", { date: today, employees, present, late, absent });

    res.json({ employees, present, late, absent });
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
