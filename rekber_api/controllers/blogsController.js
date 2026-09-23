const pool = require('../config/db');
const { submitUrlToIndexNow } = require('../utils/indexNow');

// Auto-generate text ke slug di backend
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter non-alphanumeric
    .trim() // Hapus spasi di awal dan akhir
    .replace(/\s+/g, '-') // Ganti spasi dengan tanda hubung
    .replace(/-+/g, '-'); // Hapus multiple tanda hubung
}

async function resolveUniqueSlug(baseText, excludeId = null) {
  const baseSlug = generateSlug(baseText || "blog");
  let currentSlug = baseSlug || "blog";
  let suffix = 1;

  while (true) {
    let checkResult;
    if (excludeId) {
      checkResult = await pool.query(
        "SELECT id FROM blogs WHERE slug = $1 AND id <> $2",
        [currentSlug, excludeId]
      );
    } else {
      checkResult = await pool.query("SELECT id FROM blogs WHERE slug = $1", [currentSlug]);
    }

    if (checkResult.rows.length === 0) {
      return currentSlug;
    }

    currentSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

// POST - Membuat blog baru & otomatis generate slug (Khusus Admin)
async function createBlogController(req, res) {
  try {
    const adminId = req.user.id;
    const { title, image_url, content, category_id, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ status: false, error: 'Judul dan konten wajib diisi' });
    }

    const normalizedStatus = status === 'publish' ? 'publish' : 'draft';
    const normalizedCategoryId = category_id ? Number(category_id) : null;
    const normalizedImageUrl = req.file?.path || image_url || null;

    const slug = await resolveUniqueSlug(title);

    const insertQuery = `
      INSERT INTO blogs (title, slug, image_url, content, category_id, created_by, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    
    // Ambil ID dari token middleware
    const createdBy = req.user?.id;

    // Cegat kalau ID-nya nggak ada
    if (!createdBy) {
      return res.status(401).json({ status: false, error: 'Unauthorized: User ID tidak ditemukan' });
    }

    const result = await pool.query(insertQuery, [
      title, 
      slug, 
      normalizedImageUrl, 
      content, 
      Number.isFinite(normalizedCategoryId) ? normalizedCategoryId : null, 
      createdBy,
      normalizedStatus
    ]);

    if (normalizedStatus === 'publish') {
      submitUrlToIndexNow(`/blog/${slug}`);
    }

    return res.status(201).json({
      status: true,
      message: 'Berhasil membuat blog',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ status: false, error: error.message || 'Internal server error' });
  }
}

// GET - Semua blog untuk admin dashboard
async function getAllBlogsAdminController(req, res) {
  try {
    const query = `
      SELECT
        b.*,
        c.name AS category_name
      FROM blogs b
      LEFT JOIN categories c ON c.id = b.category_id
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      status: true,
      message: 'Daftar blog admin berhasil diambil',
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting all blogs for admin:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

// GET - Detail blog by id untuk admin
async function getBlogByIdAdminController(req, res) {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        b.*,
        c.name AS category_name
      FROM blogs b
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE b.id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Blog tidak ditemukan' });
    }

    return res.status(200).json({
      status: true,
      message: 'Detail blog berhasil diambil',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting blog by id:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

// PUT - Update blog by id untuk admin
async function updateBlogController(req, res) {
  try {
    const { id } = req.params;
    const { title, image_url, content, category_id, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ status: false, error: 'Judul dan konten wajib diisi' });
    }

    const existingResult = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Blog tidak ditemukan' });
    }

    const existingBlog = existingResult.rows[0];
    const normalizedStatus = status === 'publish' ? 'publish' : 'draft';
    const normalizedCategoryId = category_id ? Number(category_id) : null;
    const normalizedImageUrl = req.file?.path || image_url || existingBlog.image_url || null;

    let slug = existingBlog.slug;
    if (!slug || title !== existingBlog.title) {
      slug = await resolveUniqueSlug(title, id);
    }

    const updateQuery = `
      UPDATE blogs
      SET
        title = $1,
        slug = $2,
        image_url = $3,
        content = $4,
        category_id = $5,
        status = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      title,
      slug,
      normalizedImageUrl,
      content,
      Number.isFinite(normalizedCategoryId) ? normalizedCategoryId : null,
      normalizedStatus,
      id
    ]);

    if (normalizedStatus === 'publish') {
      submitUrlToIndexNow(`/blog/${slug}`);
    }

    return res.status(200).json({
      status: true,
      message: 'Blog berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ status: false, error: error.message || 'Internal server error' });
  }
}

// DELETE - Hapus blog by id untuk admin
async function deleteBlogController(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Blog tidak ditemukan' });
    }

    return res.status(200).json({
      status: true,
      message: 'Blog berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

// GET - Pencarian berdasarkan slug
async function getBlogBySlugController(req, res) {
  try {
    const { slug } = req.params;

    // Merombak router pencarian menjadi berdasarkan slug
    const query = `
      SELECT
        b.*,
        c.name AS category_name
      FROM blogs b
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE b.slug = $1
    `;
    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: 'Blog tidak ditemukan' });
    }

    return res.status(200).json({
      status: true,
      message: 'Blog ditemukan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting blog by slug:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

// GET - Mengirimkan properti slug secara eksplisit
async function getPublishedBlogsController(req, res) {
  try {
    const rawLimit = Number(req.query.limit);
    const hasLimit = Number.isFinite(rawLimit) && rawLimit > 0;

    const query = `
      SELECT
        b.*,
        c.name AS category_name
      FROM blogs b
      LEFT JOIN categories c ON c.id = b.category_id
      WHERE b.status IN ('publish', 'published')
      ORDER BY b.created_at DESC
      ${hasLimit ? 'LIMIT $1' : ''}
    `;
    const result = hasLimit
      ? await pool.query(query, [rawLimit])
      : await pool.query(query);

    // Kirim properti slug secara eksplisit seperti yang diminta fase 2
    const formattedData = result.rows.map(blog => ({
      id: blog.id,
      slug: blog.slug, // Mengeksplisitkan slug
      title: blog.title,
      image_url: blog.image_url,
      content: blog.content,
      category_id: blog.category_id,
      category_name: blog.category_name,
      created_by: blog.created_by,
      status: blog.status,
      created_at: blog.created_at,
      updated_at: blog.updated_at
    }));

    return res.status(200).json({
      status: true,
      message: 'Daftar blog publish terambil',
      data: formattedData
    });
  } catch (error) {
    console.error('Error getting published blogs:', error);
    return res.status(500).json({ status: false, error: 'Internal server error' });
  }
}

module.exports = {
  createBlogController,
  getAllBlogsAdminController,
  getBlogByIdAdminController,
  updateBlogController,
  deleteBlogController,
  getBlogBySlugController,
  getPublishedBlogsController
};
