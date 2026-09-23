// controllers/adminAuthController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("../models/userModel");

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        status: false,
        error: "Email dan password wajib diisi" 
      });
    }

    // Find user by email
    const userResult = await findUserByEmail(email);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        status: false,
        error: "Email atau password salah" 
      });
    }

    const user = userResult.rows[0];

    // Check if user is admin
    if (!user.is_admin) {
      return res.status(403).json({ 
        status: false,
        error: "Akses ditolak. Hanya admin yang dapat masuk." 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        status: false,
        error: "Email atau password salah" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        is_admin: user.is_admin 
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      status: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin
        }
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}

async function getAdminProfile(req, res) {
  try {
    const userResult = await findUserByEmail(req.user.email);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        status: false,
        error: "User tidak ditemukan" 
      });
    }

    const user = userResult.rows[0];

    return res.status(200).json({
      status: true,
      message: "Profile retrieved successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin, 
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('Get admin profile error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}

module.exports = {
  adminLogin,
  getAdminProfile
};