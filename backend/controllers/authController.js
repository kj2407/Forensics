const db     = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const generateToken = (username) =>
  jwt.sign({ id: username }, process.env.JWT_SECRET || "forensics_secret", { expiresIn: "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, badgeNumber, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Check if username already exists
    const [existing] = await db.query(
      "SELECT Username FROM User_Account WHERE Username = ?", [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleMap = {
      admin: "Admin", investigator: "Officer", officer: "Officer",
      analyst: "Analyst", lab: "Analyst", viewer: "Analyst"
    };
    const dbRole = roleMap[role?.toLowerCase()] || "Officer";

    // First insert into Users table to get a User_ID
    const [userResult] = await db.query(
      "INSERT INTO Users (User_Name, Contact_Info) VALUES (?, ?)",
      [name, email]
    );
    const userId = userResult.insertId;

    // Then insert into User_Account with that User_ID
    await db.query(
      "INSERT INTO User_Account (Username, Password, Role, User_ID) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, dbRole, userId]
    );

    // Insert into Officer table if badge provided
    if (badgeNumber) {
        // Get or create a department ID
        let deptId = 1; // default dept
        const [depts] = await db.query(
          "SELECT dept_id FROM Department WHERE dept_name = ? LIMIT 1",
          [department || "General"]
        );
        if (depts.length > 0) {
          deptId = depts[0].dept_id;
        } else {
          const [newDept] = await db.query(
            "INSERT INTO Department (dept_name) VALUES (?)",
            [department || "General"]
          );
          deptId = newDept.insertId;
        }
      
        await db.query(
          "INSERT INTO Officer (Badge_No, Dept_ID) VALUES (?, ?) ON DUPLICATE KEY UPDATE Dept_ID=VALUES(Dept_ID)",
          [badgeNumber, deptId]
        );
      }

    const user = { id: userId, username: email, name, role: dbRole, badgeNumber, department };
    res.status(201).json({ token: generateToken(email), user });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      `SELECT ua.*, u.User_Name 
       FROM User_Account ua 
       LEFT JOIN Users u ON ua.User_ID = u.User_ID
       WHERE ua.Username = ?`, [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userData = { id: user.User_ID, username: user.Username, name: user.User_Name, role: user.Role };
    res.json({ token: generateToken(user.Username), user: userData });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ua.Username, ua.Role, ua.User_ID, u.User_Name
       FROM User_Account ua
       LEFT JOIN Users u ON ua.User_ID = u.User_ID
       WHERE ua.Username = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const u = rows[0];
    res.json({ id: u.User_ID, email: u.Username, name: u.User_Name, role: u.Role });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, getMe };