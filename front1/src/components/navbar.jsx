import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../api";

export default function Navbar() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mc_user");
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  // ดึงข้อมูล user ล่าสุด
  async function fetchMe() {
    try {
      const res = await fetch(`${API.BASE}/api/auth/me`, API.withCreds);
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem("mc_user", JSON.stringify(data.user));
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    fetchMe();
  }, [pathname]);

  useEffect(() => {
    function syncUser() {
      const stored = localStorage.getItem("mc_user");
      setUser(stored ? JSON.parse(stored) : null);
    }
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  async function handleLogout() {
    try {
      await fetch(`${API.BASE}/api/auth/logout`, {
        method: "POST",
        ...API.withCreds,
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("mc_authed");
      localStorage.removeItem("mc_user");
      setUser(null);
      navigate("/login", { replace: true });
    }
  }

  const active = ({ isActive }) =>
    "relative px-3 py-2 text-sm font-medium transition " +
    (isActive
      ? "text-amber-800 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-amber-700"
      : "text-amber-700 hover:text-amber-900");

  /* ========== Dropdown: ธุรกรรม ========== */
  const [dealOpen, setDealOpen] = useState(false);
  const hideTimer = useRef(null);

  const openDeal = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setDealOpen(true);
  };
  const closeDeal = () => {
    hideTimer.current = setTimeout(() => setDealOpen(false), 120);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b border-amber-200 shadow-sm"
      style={{ backgroundColor: "rgba(247, 243, 235, 0.95)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-amber-900"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg">
            M
          </div>
          <span>Music Club</span>
        </Link>

        {/* Menu (Desktop) */}
        <nav className="hidden md:flex gap-6 items-center">
          <NavLink to="/" className={active} end>
            หน้าหลัก
          </NavLink>
          <NavLink to="/members" className={active}>
            สมาชิก
          </NavLink>
          <NavLink to="/bands" className={active}>
            วง
          </NavLink>
          <NavLink to="/schedules" className={active}>
            ตารางกิจกรรม
          </NavLink>

          {/* Dropdown ธุรกรรม */}
          <div
            className="relative"
            onMouseEnter={openDeal}
            onMouseLeave={closeDeal}
          >
            <button
              className={
                "flex items-center gap-1 px-3 py-2 text-sm font-medium transition " +
                (dealOpen ? "text-amber-900" : "text-amber-700 hover:text-amber-900")
              }
            >
              ธุรกรรม
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                className="opacity-70"
              >
                <path
                  d="M5 7l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>

            {dealOpen && (
              <div
                className="absolute left-0 mt-2 w-56 rounded-xl border border-amber-200 bg-white shadow-lg p-2"
                onMouseEnter={openDeal}
                onMouseLeave={closeDeal}
              >
                <DropdownLink to="/documents" label="เอกสาร" desc="แบบฟอร์ม/ไฟล์" />
                <DropdownLink to="/finances" label="การเงิน" desc="รายรับรายจ่าย" />
                <DropdownLink to="/equipments" label="ครุภัณฑ์" desc="อุปกรณ์/ซ่อมบำรุง" />
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-amber-800">
              👋 {user.first_name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition shadow-lg"
            >
              ออกจากระบบ
            </button>
          </div>
        ) : pathname === "/login" ? (
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition shadow-lg"
          >
            สมัครสมาชิก
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-full bg-amber-900 text-white text-sm font-medium hover:bg-amber-800 transition shadow-lg"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}

/* ---- small component ---- */
function DropdownLink({ to, label, desc }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "block rounded-lg px-3 py-2 transition " +
        (isActive
          ? "bg-amber-100 text-amber-900"
          : "hover:bg-amber-50 text-amber-800")
      }
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-amber-700">{desc}</div>
    </NavLink>
  );
}
