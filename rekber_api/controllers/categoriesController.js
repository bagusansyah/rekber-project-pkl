const pool = require("../config/db");

async function getAllCategoriesController(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at, updated_at FROM categories ORDER BY name ASC"
    );

    return res.status(200).json({
      status: true,
      message: "Daftar kategori berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function createCategoryController(req, res) {
  try {
    const { name } = req.body;
    const normalizedName = String(name || "").trim();

    if (!normalizedName) {
      return res.status(400).json({ status: false, error: "Nama kategori wajib diisi" });
    }

    const existing = await pool.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1",
      [normalizedName]
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ status: false, error: "Kategori dengan nama ini sudah ada" });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING id, name, created_at, updated_at`,
      [normalizedName]
    );

    return res.status(201).json({
      status: true,
      message: "Kategori berhasil dibuat",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function updateCategoryController(req, res) {
  try {
    const categoryId = Number(req.params.id);
    const { name } = req.body;
    const normalizedName = String(name || "").trim();

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ status: false, error: "ID kategori tidak valid" });
    }
    if (!normalizedName) {
      return res.status(400).json({ status: false, error: "Nama kategori wajib diisi" });
    }

    const duplicate = await pool.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2 LIMIT 1",
      [normalizedName, categoryId]
    );

    if (duplicate.rows.length > 0) {
      return res
        .status(409)
        .json({ status: false, error: "Kategori dengan nama ini sudah ada" });
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, created_at, updated_at`,
      [normalizedName, categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Kategori tidak ditemukan" });
    }

    return res.status(200).json({
      status: true,
      message: "Kategori berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function deleteCategoryController(req, res) {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ status: false, error: "ID kategori tidak valid" });
    }

    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING id", [
      categoryId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Kategori tidak ditemukan" });
    }

    return res.status(200).json({
      status: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

module.exports = {
  getAllCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
};
