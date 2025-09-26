const express = require('express');
const pool = require('../db');
const router = express.Router();

// Middleware ตรวจสอบการเข้าสู่ระบบ
const { requireAuth, requireAdminOrCommittee } = require('../middleware/auth');

// ดึงรายชื่อวงดนตรีทั้งหมด
router.get('/getAllBands', requireAuth, async (req, res) => {
  try {
    const [bands] = await pool.query(`
      SELECT id, name, \`year\`, description
      FROM bands
      ORDER BY \`year\` DESC, name ASC
    `);
    res.json({ message: 'ดึงข้อมูลวงดนตรีสำเร็จ', bands, total: bands.length });
  } catch (err) {
    console.error('getAllBands error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// เพิ่มวง
router.post('/', requireAuth, requireAdminOrCommittee, async (req, res) => {
  const { name, year, description } = req.body;
  if (!name || !year) return res.status(400).json({ message: 'กรุณากรอกชื่อวงและปีที่จัดตั้ง' });

  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear + 10)
    return res.status(400).json({ message: 'ปีที่จัดตั้งไม่ถูกต้อง' });

  try {
    const [dup] = await pool.query('SELECT id FROM bands WHERE name = ?', [name]);
    if (dup.length) return res.status(400).json({ message: 'ชื่อวงนี้มีอยู่แล้ว' });

    const [result] = await pool.query(
      'INSERT INTO bands (name, `year`, description) VALUES (?, ?, ?)',
      [name, year, description || null]
    );

    const [rows] = await pool.query('SELECT id, name, `year`, description FROM bands WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'เพิ่มวงดนตรีสำเร็จ', band: rows[0] });
  } catch (err) {
    console.error('create band error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ดึงรายละเอียดวง
router.get('/getBand/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [bandRows] = await pool.query('SELECT id, name, `year`, description FROM bands WHERE id = ?', [id]);
    if (!bandRows.length) return res.status(404).json({ message: 'ไม่พบวงดนตรีที่ระบุ' });

    const [schedules] = await pool.query(
      `SELECT id, activity, date, time, location
       FROM schedules
       WHERE band_id = ?
       ORDER BY date ASC, time ASC`,
      [id]
    );

    res.json({ message: 'ดึงข้อมูลวงดนตรีสำเร็จ', band: { ...bandRows[0], schedules } });
  } catch (err) {
    console.error('getBand error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// แก้ไขวง
router.put('/updateBand/:id', requireAuth, requireAdminOrCommittee, async (req, res) => {
  const { id } = req.params;
  const { name, year, description } = req.body;
  if (!name || !year) return res.status(400).json({ message: 'กรุณากรอกชื่อวงและปีที่จัดตั้ง' });

  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear + 10)
    return res.status(400).json({ message: 'ปีที่จัดตั้งไม่ถูกต้อง' });

  try {
    const [exist] = await pool.query('SELECT id FROM bands WHERE id = ?', [id]);
    if (!exist.length) return res.status(404).json({ message: 'ไม่พบวงดนตรีที่ระบุ' });

    const [dup] = await pool.query('SELECT id FROM bands WHERE name = ? AND id != ?', [name, id]);
    if (dup.length) return res.status(400).json({ message: 'ชื่อวงนี้มีอยู่แล้ว' });

    await pool.query('UPDATE bands SET name = ?, `year` = ?, description = ? WHERE id = ?', [
      name,
      year,
      description || null,
      id,
    ]);

    const [rows] = await pool.query('SELECT id, name, `year`, description FROM bands WHERE id = ?', [id]);
    res.json({ message: 'อัปเดตข้อมูลวงดนตรีสำเร็จ', band: rows[0] });
  } catch (err) {
    console.error('updateBand error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ลบวงดนตรี (สำหรับ admin เท่านั้น)
router.delete('/deleteBand/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [currentUser] = await pool.query('SELECT role FROM users WHERE id = ?', [req.session.userId]);
    if (currentUser.length === 0 || currentUser[0].role !== 'ผู้ดูแล') {
      return res.status(403).json({ message: 'เฉพาะผู้ดูแลเท่านั้นที่สามารถลบวงดนตรีได้' });
    }

    const [bandExists] = await pool.query('SELECT id FROM bands WHERE id = ?', [id]);
    if (bandExists.length === 0) {
      return res.status(404).json({ message: 'ไม่พบวงดนตรีที่ระบุ' });
    }

    const [relatedSchedules] = await pool.query('SELECT COUNT(*) as count FROM schedules WHERE band_id = ?', [id]);
    if (relatedSchedules[0].count > 0) {
      return res.status(400).json({ 
        message: 'ไม่สามารถลบวงได้ เนื่องจากมีตารางซ้อม/แสดงที่เชื่อมโยงอยู่ กรุณาลบตารางเหล่านั้นก่อน' 
      });
    }

    await pool.query('DELETE FROM bands WHERE id = ?', [id]);
    res.json({ message: 'ลบวงดนตรีสำเร็จ' });
  } catch (err) {
    console.error('deleteBand error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// ค้นหาวงดนตรี
router.get('/searchBands', requireAuth, async (req, res) => {
  const { keyword, year } = req.query;

  try {
    let query = 'SELECT id, name, `year`, description, created_at FROM bands WHERE 1=1';
    const params = [];

    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (year) {
      query += ' AND `year` = ?';
      params.push(year);
    }

    query += ' ORDER BY `year` DESC, name ASC';

    const [bands] = await pool.query(query, params);

    res.json({
      message: 'ค้นหาวงดนตรีสำเร็จ',
      bands,
      total: bands.length,
      searchCriteria: { keyword, year }
    });
  } catch (err) {
    console.error('searchBands error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// สถิติวง
router.get('/getBandStats', requireAuth, async (req, res) => {
  try {
    const [totalBands] = await pool.query('SELECT COUNT(*) as total FROM bands');
    const [bandsByYear] = await pool.query(`
      SELECT \`year\`, COUNT(*) as count
      FROM bands
      GROUP BY \`year\`
      ORDER BY \`year\` DESC
    `);
    const [totalSchedules] = await pool.query('SELECT COUNT(*) as total FROM schedules');
    const [mostActiveBands] = await pool.query(`
      SELECT b.id, b.name, COUNT(s.id) as schedule_count
      FROM bands b
      LEFT JOIN schedules s ON b.id = s.band_id
      GROUP BY b.id, b.name
      ORDER BY schedule_count DESC
      LIMIT 5
    `);

    res.json({
      message: 'ดึงสถิติวงดนตรีสำเร็จ',
      stats: {
        totalBands: totalBands[0].total,
        totalSchedules: totalSchedules[0].total,
        bandsByYear,
        mostActiveBands
      }
    });
  } catch (err) {
    console.error('getBandStats error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
