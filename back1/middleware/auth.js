// middleware/auth.js
const pool = require('../db');

/** อ่าน userId จาก session (รองรับทั้งรูปแบบเก่า/ใหม่) */
function getSessionUserId(req) {
  return req.session?.user?.id || req.session?.userId || null;
}

/** โหลด role จาก DB ด้วยคอลัมน์ id เท่านั้น */
async function fetchUserRoleById(userId) {
  const [rows] = await pool.query(
    'SELECT role FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows?.[0]?.role || null;
}

/** ต้องล็อกอินก่อน */
function requireAuth(req, res, next) {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ message: 'ยังไม่ได้เข้าสู่ระบบ' });
  return next();
}

/** ตัวตรวจ role แบบกำหนดได้ */
function requireRole(allowed = []) {
  return async (req, res, next) => {
    try {
      const uid = getSessionUserId(req);
      if (!uid) return res.status(401).json({ message: 'ยังไม่ได้เข้าสู่ระบบ' });

      let role = req.session?.user?.role;
      if (!role) {
        role = await fetchUserRoleById(uid);
        if (!role) return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
        // cache กลับ session
        req.session.user = { id: uid, role };
      }

      req.user = { id: uid, role };
      if (allowed.length && !allowed.includes(role)) {
        return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
      }
      return next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  };
}

const requireAdmin = requireRole(['ผู้ดูแล']);
const requireAdminOrCommittee = requireRole(['ผู้ดูแล', 'กรรมการ']);

module.exports = { requireAuth, requireAdmin, requireAdminOrCommittee };
