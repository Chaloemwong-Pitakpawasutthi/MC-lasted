const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./db');
require('dotenv').config();

const app = express();

// ถ้าอยู่หลัง proxy (เช่น nginx) ให้เปิดบรรทัดนี้
// app.set('trust proxy', 1);

// --- CORS (dev) ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-access-token','x-auth-token'],
}));

// --- Body parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session store ---
const sessionStore = new MySQLStore({}, pool);
// Session (dev cookie)
app.use(session({
  name: 'mc.sid',
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000,      // 1 day
    httpOnly: true,
    sameSite: 'lax',       // สำคัญกับ cross-site ใน dev
    secure: false,         // localhost ต้อง false; บน HTTPS ให้ true
  },
}));

// --- Static ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const bandRoutes = require('./routes/bands');
const scheduleRoutes = require('./routes/schedules');
const userRoutes = require('./routes/users');
const financeRoutes = require('./routes/finances');
const projectRoutes = require('./routes/projects');
const equipmentsRoutes = require('./routes/equipments');
const permissionRoutes = require('./routes/permissions');

// แก้ไฟล์นี้ถ้าตั้งใจใช้อีก router จริง ๆ
// const documentRoutes = require('./routes/documents'); // ← ถ้ามีไฟล์นี้
// app.use('/api/documents', documentRoutes);

// ถ้าต้องการอัปโหลดไฟล์
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes); 
app.use('/api/files', uploadRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/bands', bandRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/equipments', equipmentsRoutes);
app.use('/api/permissions', permissionRoutes);

// 404 ตอบให้เคลียร์
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler — log เต็ม ๆ เพื่อจับ 500
app.use((err, req, res, next) => {
  console.error('Error:', err && (err.stack || err));
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
