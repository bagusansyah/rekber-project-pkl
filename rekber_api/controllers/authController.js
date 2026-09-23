const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const {
  createUser,
  findUserByEmail,
  activateUser,
  findUserByActivateToken,
  findUserByPhone,
  createUserDetail,
  findUserById,
  findUserByGoogleId,
  linkGoogleId,
  createUserFromGoogle,
} = require("../models/userModel");
const { sendEmail } = require("../utils/email");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

require("dotenv").config();

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  const { name, email, password, phone } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email dan password tidak boleh kosong" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format email tidak sesuai" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password minimal 8 karakter, harus ada huruf besar, huruf kecil, dan angka",
    });
  }

  if (!phone) {
    return res
      .status(400)
      .json({ error: "Nomor HP tidak boleh kosong" });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email sudah digunakan" });
    }

    const resultPhone = await findUserByPhone(phone);
    if (resultPhone.rows.length > 0) {
      return res.status(409).json({ error: "Nomor HP sudah digunakan" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const activateToken = crypto.randomBytes(32).toString("hex");
    const normalizedEmail = email.toLowerCase().trim();

    const user = await createUser(
      name,
      normalizedEmail,
      hashedPassword,
      activateToken,
      phone
    );

    await createUserDetail({
      user_id: user.id,
    });

    const activationSubject = "Aktivasi Akun Rekber.com";
    const activationHtml = `
      <p>Halo ${name},</p>
      <p>Terima kasih telah mendaftar di Rekber.com!</p>
      <p>Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>
      <div class="button-container">
        <a href="https://www.rekber.com/auth/activate?token=${activateToken}" class="button">Aktivasi Akun</a>
      </div> 
      <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
    `;

    try {
      await sendEmail(email, activationSubject, activationHtml);
    } catch (emailError) {
      console.error("Error sending activation email:", emailError);
    }

    return res.status(201).json({
      message:
        "User registered successfully. Please check your email for activation link.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_on: user.created_on,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "email and password are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "invalid email format" });
  }

  try {
    const result = await findUserByEmail(email);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status === 0) {
      return res.status(403).json({
        error:
          "Akun belum diaktivasi. Silakan aktifasi email terlebih dahulu.",
        code: "EMAIL_NOT_ACTIVATED",
      });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function googleLogin(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Token Google tidak ditemukan" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return res.status(401).json({ error: "Email Google belum terverifikasi" });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = (await findUserByGoogleId(payload.sub)).rows[0];

    if (!user) {
      const existingByEmail = await findUserByEmail(normalizedEmail);
      if (existingByEmail.rows.length > 0) {
        user = existingByEmail.rows[0];
        await linkGoogleId(user.id, payload.sub);
      } else {
        const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
        user = await createUserFromGoogle({
          name: payload.name || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          googleId: payload.sub,
          passwordHash: randomPasswordHash,
        });
        await createUserDetail({ user_id: user.id });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(401).json({ error: "Verifikasi login Google gagal" });
  }
}

async function activateAccount(req, res) {
  const token = req.query.token || req.body.token;

  if (!token) {
    return res
      .status(400)
      .json({ error: "Token aktivasi diperlukan" });
  }

  try {
    const result = await findUserByActivateToken(token);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Token aktivasi tidak valid atau sudah kadaluarsa",
        });
    }

    const user = result.rows[0];

    if (user.status === 1) {
      return res
        .status(400)
        .json({ error: "Akun sudah diaktifkan sebelumnya" });
    }

    await activateUser(user.id);

    const confirmationSubject = "Akun Berhasil Diaktifkan - Rekber.com";
    const confirmationHtml = `
      <p>Halo ${user.name},</p>
      <p>Selamat! Akun Rekber.com Anda telah berhasil diaktifkan.</p>
      <p>Anda sekarang dapat masuk ke akun Anda dan mulai menggunakan layanan Rekber.com.</p>
      <div class="button-container">
        <a href="https://www.rekber.com/auth/login" class="button">Masuk ke Akun</a>
      </div>
      <p>Terima kasih telah bergabung dengan Rekber.com!</p>
    `;

    sendEmail(user.email, confirmationSubject, confirmationHtml).catch(
      (err) => {
        console.error("Error sending confirmation email:", err);
      }
    );

    return res.status(200).json({
      message:
        "Akun berhasil diaktifkan. Silakan login untuk melanjutkan.",
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function changePassword(req, res) {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Password lama dan baru wajib diisi" });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error:
        "Password baru minimal 8 karakter, harus ada huruf besar, huruf kecil, dan angka",
    });
  }

  try {
    const result = await findUserById(userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const user = result.rows[0];
    const validOld = await bcrypt.compare(oldPassword, user.password);

    if (!validOld) {
      return res.status(401).json({ error: "Password lama salah" });
    }

    const saltRounds = 10;
    const hashedNew = await bcrypt.hash(newPassword, saltRounds);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedNew,
      userId,
    ]);

    const subject = "Informasi Perubahan Password Rekber.com";
    const html = `
      <p>Halo ${user.name},</p>
      <p>Password akun Rekber.com Anda telah berhasil diubah.</p>
      <p>Jika Anda tidak melakukan perubahan ini, segera hubungi support kami.</p>
      <p>Terima kasih.</p>
    `;

    try {
      await sendEmail(user.email, subject, html);
    } catch (emailError) {
      console.error("Error sending password change email:", emailError);
    }

    return res.status(200).json({ message: "Password berhasil diganti" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  activateAccount,
  changePassword,
};