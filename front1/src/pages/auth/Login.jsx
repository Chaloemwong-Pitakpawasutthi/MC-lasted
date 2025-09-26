import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api";
import mcImg from "../../assets/mc.jpg";


export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canSubmit = useMemo(
    () => /\S+@\S+\.\S+/.test(email) && pw.length >= 6,
    [email, pw]
  );

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API.BASE}/api/auth/login`, {
        method: "POST",
        ...API.withCreds,
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message || "เข้าสู่ระบบไม่สำเร็จ");
        localStorage.removeItem("mc_authed");
        localStorage.removeItem("mc_user");
        setLoading(false);
        return;
      }

      // ดึงข้อมูลผู้ใช้
      try {
        const meRes = await fetch(`${API.BASE}/api/auth/me`, API.withCreds);
        if (meRes.ok) {
          const me = await meRes.json();
          if (me?.user) {
            localStorage.setItem("mc_user", JSON.stringify(me.user));
            window.dispatchEvent(new Event("storage")); // 👈 แจ้ง Navbar
          }
        }
      } catch {}

      localStorage.setItem("mc_authed", "1");
      navigate("/", { replace: true });

    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left side */}
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            เข้าสู่ระบบ
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Music Club Kukps
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            ยินดีต้อนรับกลับสู่ชมรมดนตรี
            <br />
            เข้าร่วมสร้างสรรค์เสียงเพลงไปด้วยกัน
          </p>

          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
            </div>

            <button
              disabled={!canSubmit || loading}
              className={
                "w-full rounded-full px-6 py-3 font-semibold transition flex justify-center items-center " +
                (canSubmit && !loading
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed")
              }
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            {msg && <p className="text-center text-sm text-rose-600">{msg}</p>}

            <p className="text-sm text-gray-600 text-center">
              ยังไม่มีบัญชี?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </form>
        </div>

        {/* Right side */}
        <div className="hidden md:block">
          <img
            className="w-full rounded-3xl shadow-lg object-cover aspect-[4/3]"
            src={mcImg}
            alt="Music Club students"
          />
        </div>
      </div>
    </div>
  );
}
