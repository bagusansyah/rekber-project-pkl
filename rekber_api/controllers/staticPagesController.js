const pool = require("../config/db");

const ALLOWED_SLUGS = [
  "tentang-kami",
  "syarat-dan-ketentuan",
  "kebijakan-privasi",
  "kebijakan-refund",
];

async function getPageBySlugController(req, res) {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      "SELECT slug, page_type, title, meta_description, content, updated_at FROM static_pages WHERE slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Halaman tidak ditemukan" });
    }

    return res.status(200).json({
      status: true,
      message: "Halaman ditemukan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting static page by slug:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function getAllPagesAdminController(req, res) {
  try {
    const result = await pool.query(
      "SELECT slug, page_type, title, meta_description, content, updated_at FROM static_pages ORDER BY slug ASC"
    );

    return res.status(200).json({
      status: true,
      message: "Daftar halaman berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting static pages:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function updatePageController(req, res) {
  try {
    const { slug } = req.params;

    if (!ALLOWED_SLUGS.includes(slug)) {
      return res.status(400).json({ status: false, error: "Slug halaman tidak valid" });
    }

    const { title, meta_description, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ status: false, error: "Judul dan konten wajib diisi" });
    }

    const result = await pool.query(
      `UPDATE static_pages
       SET title = $1, meta_description = $2, content = $3, updated_at = NOW()
       WHERE slug = $4
       RETURNING slug, page_type, title, meta_description, content, updated_at`,
      [title, meta_description || null, JSON.stringify(content), slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Halaman tidak ditemukan" });
    }

    return res.status(200).json({
      status: true,
      message: "Halaman berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating static page:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

module.exports = {
  getPageBySlugController,
  getAllPagesAdminController,
  updatePageController,
};
