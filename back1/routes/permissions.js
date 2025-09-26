const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Allowed roles
const ROLES = ['ผู้ดูแล','กรรมการ','สมาชิก'];

// list allowed roles
router.get('/roles', requireAuth, (req, res) => {
  res.json({ message: 'รายการบทบาท', roles: ROLES });
});

// list users (optional filter ?role=กรรมการ)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  const role = (req.query.role || '').trim();
  const where = [];
  const params = [];
  if (role) { where.push('role = ?'); params.push(role); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  try {
    const [rows] = await pool.query(
      `SELECT id, username, fullname, role FROM users ${whereSql} ORDER BY role ASC, fullname ASC`,
      params
    );
    res.json({ message: 'ดึงรายชื่อผู้ใช้สำเร็จ', users: rows, total: rows.length });
  } catch (e) { console.error(e); res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' }); }
});

// get one user's role
router.get('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, username, fullname, role FROM users WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    res.json({ message: 'ดึงข้อมูลผู้ใช้สำเร็จ', user: rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' }); }
});

// change a user's role (prevent demoting last admin)
router.put('/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  const { role } = req.body;

  if (!ROLES.includes(role)) return res.status(400).json({ message: 'role ไม่ถูกต้อง' });
  if (targetId === req.session.userId && role !== 'ผู้ดูแล') {
    // อนุโลมให้ลดตนเองได้ถ้าไม่ใช่คนสุดท้าย? — ป้องกันไว้ก่อน
  }

  try {
    const [[{ admins }]] = await pool.query(`SELECT COUNT(*) AS admins FROM users WHERE role='ผู้ดูแล'`);
    const [targetRows] = await pool.query(`SELECT id, role FROM users WHERE id = ?`, [targetId]);
    if (targetRows.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    const currentRole = targetRows[0].role;

    // ถ้าจะลดผู้ดูแล และมีผู้ดูแลอยู่แค่ 1 คน → ไม่อนุญาต
    if (currentRole === 'ผู้ดูแล' && role !== 'ผู้ดูแล' && admins <= 1) {
      return res.status(400).json({ message: 'ไม่สามารถลดผู้ดูแลคนสุดท้ายได้' });
    }

    const [r] = await pool.query(`UPDATE users SET role = ? WHERE id = ?`, [role, targetId]);
    if (r.affectedRows === 0) return res.status(404).json({ message: 'อัปเดตบทบาทไม่สำเร็จ' });

    res.json({ message: 'อัปเดตบทบาทสำเร็จ', id: targetId, role });
  } catch (e) { console.error(e); res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' }); }
});

// bulk change { changes: [{id, role}, ...] }
router.post('/users/bulk', requireAuth, requireAdmin, async (req, res) => {
  const changes = Array.isArray(req.body?.changes) ? req.body.changes : [];
  if (changes.length === 0) return res.status(400).json({ message: 'ไม่มีรายการเปลี่ยนบทบาท' });

  // ตรวจ role ผิดก่อน
  for (const c of changes) {
    if (!c || typeof c.id !== 'number' || !ROLES.includes(c.role)) {
      return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้องใน changes' });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // กันไม่ให้เหลือ admin 0
    const [[{ adminsBefore }]] = await conn.query(`SELECT COUNT(*) AS adminsBefore FROM users WHERE role='ผู้ดูแล'`);

    // นับว่าจะลด admin ลงกี่คน และเพิ่มกี่คน
    let adminDelta = 0;
    for (const c of changes) {
      const [row] = await conn.query(`SELECT role FROM users WHERE id = ? FOR UPDATE`, [c.id]);
      if (row.length === 0) throw new Error('ไม่พบผู้ใช้บางรายการ');

      const was = row[0].role, will = c.role;
      if (was === 'ผู้ดูแล' && will !== 'ผู้ดูแล') adminDelta -= 1;
      if (was !== 'ผู้ดูแล' && will === 'ผู้ดูแล') adminDelta += 1;
    }
    const adminsAfter = adminsBefore + adminDelta;
    if (adminsAfter <= 0) throw new Error('การเปลี่ยนแปลงทำให้ไม่มีผู้ดูแลเหลืออยู่');

    // apply
    for (const c of changes) {
      await conn.query(`UPDATE users SET role = ? WHERE id = ?`, [c.role, c.id]);
    }

    await conn.commit();
    res.json({ message: 'อัปเดตบทบาทแบบกลุ่มสำเร็จ', count: changes.length });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(400).json({ message: e.message || 'อัปเดตบทบาทแบบกลุ่มไม่สำเร็จ' });
  } finally {
    conn.release();
  }
});

module.exports = router;
