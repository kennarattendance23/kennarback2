// === backend/routes/employee.js ===
import express from "express";
import multer from "multer";
import db from "../config/database.js";

const router = express.Router();

// === For image upload ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Serve employee image (stored as LONGBLOB) as base64
app.get('/api/employee/:id/image', (req, res) => {
	const employeeId = req.params.id;

	// Query the employee's image from the database
	db.query('SELECT image FROM employees WHERE id = ?', [employeeId], (err, results) => {
		if (err) return res.status(500).json({ error: 'Database error' });

		if (!results.length || !results[0].image) {
			return res.status(404).json({ error: 'No image found for this employee' });
		}

		const imgBuffer = results[0].image;

		// You can store the MIME type in the database for accuracy, 
		// but here we'll default to JPEG
		const mimeType = 'image/jpeg';
		const base64Img = imgBuffer.toString('base64');

		// Send the image as base64
		res.json({ base64: `data:${mimeType};base64,${base64Img}` });
	});
});


// === Get all employees ===
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employees");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// === Add new employee ===
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      employee_id,
      name,
      mobile_phone,
      date_of_birth,
      status,
      face_embedding,
      fingerprint_id,
    } = req.body;

    if (!employee_id || !name) {
      return res.status(400).json({ error: "Employee ID and Name are required" });
    }

    const image = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO employees 
      (employee_id, name, mobile_phone, date_of_birth, image, face_embedding, fingerprint_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [
      employee_id,
      name,
      mobile_phone || null,
      date_of_birth || null,
      image || null,
      face_embedding || null,
      fingerprint_id || null,
      status || "Active",
    ]);

    res.json({ message: "✅ Employee added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Employee ID already exists" });
    } else {
      console.error("❌ Error adding employee:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
});

// === Update employee ===
router.put("/:employee_id", upload.single("image"), async (req, res) => {
  try {
    const { employee_id } = req.params;
    const {
      name,
      mobile_phone,
      date_of_birth,
      status,
      face_embedding,
      fingerprint_id,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    let query = `
      UPDATE employees
      SET name=?, mobile_phone=?, date_of_birth=?, status=?, face_embedding=?, fingerprint_id=?`;
    const params = [
      name,
      mobile_phone || null,
      date_of_birth || null,
      status || "Active",
      face_embedding || null,
      fingerprint_id || null,
    ];

    if (image) {
      query += `, image=?`;
      params.push(image);
    }

    query += ` WHERE employee_id=?`;
    params.push(employee_id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "✅ Employee updated successfully" });
  } catch (err) {
    console.error("❌ Error updating employee:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// === Delete employee (remove attendance first) ===
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete attendance logs first
    await db.query("DELETE FROM attendance WHERE employee_id = ?", [id]);

    // Delete employee by id (primary key)
    const [result] = await db.query("DELETE FROM employees WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "✅ Employee deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting employee:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
