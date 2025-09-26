// routes/members.js
const express = require('express');
const pool = require('../db');
const router = express.Router();
const { requireAuth, requireAdminOrCommittee } = require('../middleware/auth');

/**
 * หมายเหตุสำคัญ:
 * ให้ประกาศเส้นทางแบบ "คงที่" มาก่อนเส้นที่มีพารามิเตอร์ (/:id)
 * ไม่งั้น /getNonMembers หรือ /non-members จะถูกจับเป็น id
 */

/* -------------------- ผู้ใช้ที่ยังไม่เป็นสมาชิก (ต้องอยู่บนสุด) -------------------- */
router.get('/non-members', requireAuth, requireAdminOrCommittee, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.prefix, u.first_name, u.last_name, u.email, u.faculty
      FROM users u
      LEFT JOIN members m ON u.id = m.user_id
      WHERE m.user_id IS NULL
      ORDER BY u.first_name, u.last_name
    `);

    const formatted = users.map(u => ({
      id: u.id,
      name: `${u.prefix} ${u.first_name} ${u.last_name}`,
      email: u.email,
      faculty: u.faculty
    }));

    res.json({
      message: 'ดึงรายชื่อผู้ใช้ที่ยังไม่เป็นสมาชิกสำเร็จ',
      users: formatted,
      total: formatted.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// alias เดิมให้ของเก่ายังใช้ได้ (ใช้ baseUrl เพื่อความชัวร์)
router.get('/getNonMembers', requireAuth, requireAdminOrCommittee, (req, res) => {
  return res.redirect(307, `${req.baseUrl}/non-members`);
});

/* -------------------- ดึงรายชื่อสมาชิกทั้งหมด -------------------- */
router.get('/', requireAuth, async (req, res) => {
  try {
    const [members] = await pool.query(`
      SELECT 
        m.id,
        m.user_id,
        m.join_date,
        m.status,
        u.prefix,
        u.first_name,
        u.last_name,
        u.email,
        u.faculty,
        u.role
      FROM members m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.join_date DESC
    `);

    const formattedMembers = members.map(member => ({
      id: member.id,
      user_id: member.user_id,
      name: `${member.prefix} ${member.first_name} ${member.last_name}`,
      email: member.email,
      faculty: member.faculty,
      role: member.role,
      join_date: member.join_date,
      status: member.status
    }));

    res.json({
      message: 'ดึงข้อมูลสมาชิกสำเร็จ',
      members: formattedMembers,
      total: formattedMembers.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

/* -------------------- เพิ่มสมาชิกใหม่ -------------------- */
router.post('/', requireAuth, requireAdminOrCommittee, async (req, res) => {
  const { user_id, join_date, status = 'active' } = req.body;

  try {
    const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ระบุ' });
    }

    const [memberExists] = await pool.query('SELECT id FROM members WHERE user_id = ?', [user_id]);
    if (memberExists.length > 0) {
      return res.status(400).json({ message: 'ผู้ใช้นี้เป็นสมาชิกอยู่แล้ว' });
    }

    const [result] = await pool.query(
      'INSERT INTO members (user_id, join_date, status) VALUES (?, ?, ?)',
      [user_id, join_date || new Date().toISOString().split('T')[0], status]
    );

    const [newMember] = await pool.query(`
      SELECT 
        m.id,
        m.user_id,
        m.join_date,
        m.status,
        u.prefix,
        u.first_name,
        u.last_name,
        u.email,
        u.faculty
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'เพิ่มสมาชิกสำเร็จ',
      member: {
        id: newMember[0].id,
        user_id: newMember[0].user_id,
        name: `${newMember[0].prefix} ${newMember[0].first_name} ${newMember[0].last_name}`,
        email: newMember[0].email,
        faculty: newMember[0].faculty,
        join_date: newMember[0].join_date,
        status: newMember[0].status
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

/* -------------------- อัปเดตสถานะสมาชิก -------------------- */
router.put('/updateMemberStatus/:id', requireAuth, requireAdminOrCommittee, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
  }

  try {
    const [memberExists] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (memberExists.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสมาชิกที่ระบุ' });
    }

    await pool.query('UPDATE members SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'อัปเดตสถานะสมาชิกสำเร็จ' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

/* -------------------- ลบสมาชิก (เฉพาะผู้ดูแล) -------------------- */
router.delete('/deleteMember/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [currentUser] = await pool.query('SELECT role FROM users WHERE id = ?', [req.session.userId]);
    const role = (currentUser[0]?.role || '').trim();

    if (!currentUser.length || role !== 'ผู้ดูแล') {
      return res.status(403).json({ message: 'เฉพาะผู้ดูแลเท่านั้นที่สามารถลบสมาชิกได้' });
    }

    const [memberExists] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (!memberExists.length) {
      return res.status(404).json({ message: 'ไม่พบสมาชิกที่ระบุ' });
    }

    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ message: 'ลบสมาชิกสำเร็จ' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

/* -------------------- ดึงข้อมูลสมาชิกตาม ID (ไว้ท้ายสุด) -------------------- */
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [member] = await pool.query(`
      SELECT 
        m.id,
        m.user_id,
        m.join_date,
        m.status,
        u.prefix,
        u.first_name,
        u.last_name,
        u.email,
        u.faculty,
        u.role
      FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [id]);

    if (member.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสมาชิกที่ระบุ' });
    }

    const x = member[0];
    res.json({
      message: 'ดึงข้อมูลสมาชิกสำเร็จ',
      member: {
        id: x.id,
        user_id: x.user_id,
        name: `${x.prefix} ${x.first_name} ${x.last_name}`,
        email: x.email,
        faculty: x.faculty,
        role: x.role,
        join_date: x.join_date,
        status: x.status
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;
