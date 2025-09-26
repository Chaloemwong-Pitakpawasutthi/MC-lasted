import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api";

export default function Register() {
  const [form, setForm] = useState({
    prefix: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    faculty: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const prefixes = ["นาย", "นาง", "นางสาว"];
  const faculties = [
    "คณะเกษตร กำแพงแสน",
    "คณะวิศวกรรมศาสตร์ กำแพงแสน",
    "คณะสัตวแพทยศาสตร์",
    "คณะวิทยาศาสตร์การกีฬาและสุขภาพ",
    "คณะศิลปศาสตร์และวิทยาศาสตร์",
    "คณะศึกษาศาสตร์และพัฒนศาสตร์",
    "คณะประมง",
    "คณะสิ่งแวดล้อม",
    "บัณฑิตวิทยาลัย",
    "คณะอุตสาหกรรมบริการ"
  ];

  const onChange = (k, v) => setForm({ ...form, [k]: v });

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    // ตรวจสอบ password และ confirmPassword
    if (form.password !== form.confirmPassword) {
      setMsg("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API.BASE}/api/auth/register`, {
  method: "POST",
  ...API.withCreds,
  body: JSON.stringify({
    prefix: form.prefix,
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    password: form.password,
    faculty: form.faculty,
  }),
});
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message || "สมัครสมาชิกไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setMsg("สมัครสมาชิกสำเร็จ");
      navigate("/login", { replace: true });
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
            สมัครสมาชิก
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Music Club Kukps
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            มาร่วมเป็นส่วนหนึ่งกับชมรมดนตรี
          </p>

          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-5"
          >
            <div className="grid grid-cols-2 gap-3">
              <select
                className="rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.prefix}
                onChange={(e) => onChange("prefix", e.target.value)}
              >
                <option value="">เลือกคำนำหน้า</option>
                {prefixes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                className="rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.faculty}
                onChange={(e) => onChange("faculty", e.target.value)}
              >
                <option value="">เลือกคณะ/สังกัด</option>
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ชื่อ"
                value={form.first_name}
                onChange={(e) => onChange("first_name", e.target.value)}
              />
              <input
                className="rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="นามสกุล"
                value={form.last_name}
                onChange={(e) => onChange("last_name", e.target.value)}
              />
            </div>

            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
            />

            <button
              disabled={loading}
              className={
                "w-full rounded-full px-6 py-3 font-semibold transition " +
                (loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800")
              }
            >
              {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
            </button>

            {msg && <p className="text-center text-sm text-rose-600">{msg}</p>}

            <p className="text-sm text-gray-600 text-center">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </div>

        {/* Right side */}
        <div className="hidden md:block">
          <img
            className="w-full rounded-3xl shadow-lg object-cover aspect-[4/3]"
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1400&auto=format&fit=crop"
            alt="Register music club"
          />
        </div>
      </div>
    </div>
  );
}
