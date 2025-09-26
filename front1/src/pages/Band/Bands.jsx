// src/pages/bands/Bands.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../../api";

/* ========== โมดัลเพิ่มวง ========== */
function AddBandModal({ open, onClose, onCreated }) {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [form, setForm] = useState({ name: "", year: currentYear, description: "" });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setForm({ name: "", year: currentYear, description: "" });
    setErrors({});
    setServerMsg("");
    setLoading(false);
  }, [currentYear]);

  // ปิดด้วย ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if (!open) reset(); }, [open, reset]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "กรุณากรอกชื่อวง";
    if (form.year === "" || isNaN(Number(form.year))) {
      e.year = "กรุณากรอกปีที่จัดตั้งเป็นตัวเลข";
    } else {
      const y = Number(form.year);
      if (y < 1900 || y > currentYear + 10) e.year = `ปีที่จัดตั้งต้องอยู่ระหว่าง 1900 - ${currentYear + 10}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputCls =
    "block w-full rounded-xl border border-amber-300 bg-white/80 px-4 py-2.5 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "year" ? value.replace(/\D/g, "") : value }));
    if (serverMsg) setServerMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerMsg("");
    try {
      const res = await fetch(`${API.BASE}/api/bands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          year: Number(form.year),
          description: form.description.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "บันทึกไม่สำเร็จ");
      }
      onCreated?.(); // ให้หน้า list รีโหลด
      onClose?.();   // ปิดโมดัล
    } catch (err) {
      setServerMsg(err.message || "เกิดข้อผิดพลาดในระบบ");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white/95 backdrop-blur shadow-2xl border border-amber-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
            <h3 className="text-lg font-semibold text-amber-900">เพิ่มรายการ</h3>
            <button onClick={onClose} className="text-amber-700 hover:text-amber-900">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-medium text-amber-900">ชื่อวง <span className="text-red-600">*</span></label>
                <input
                  name="name" placeholder="เช่น MC Acoustic" value={form.name}
                  onChange={handleChange} className={inputCls}
                  maxLength={100}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-2 block font-medium text-amber-900">ปีที่จัดตั้ง <span className="text-red-600">*</span></label>
                <input
                  name="year" placeholder={`${currentYear}`} value={form.year}
                  onChange={handleChange} className={inputCls}
                  inputMode="numeric" pattern="\d*"
                />
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                <p className="mt-1 text-xs text-amber-700">ช่วงที่ยอมรับ: 1900 - {currentYear + 10}</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-amber-900">คำอธิบาย (ไม่บังคับ)</label>
              <textarea
                name="description" rows={4} value={form.description}
                onChange={handleChange} className={inputCls} placeholder="รายละเอียด เช่น แนวเพลง สมาชิก ฯลฯ" maxLength={500}
              />
              <p className="mt-1 text-xs text-amber-700">{form.description.length}/500</p>
            </div>

            {serverMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-center">
                {serverMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button" onClick={onClose}
                className="rounded-xl border border-amber-300 bg-white px-5 py-2.5 font-semibold text-amber-900 hover:bg-amber-50 shadow"
              >
                ยกเลิก
              </button>
              <button
                type="submit" disabled={loading}
                className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "กำลังบันทึก..." : "เพิ่มรายการ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ========== หน้าแสดงวง + ปุ่มเปิดโมดัล ========== */
export default function Bands() {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const loadBands = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API.BASE}/api/bands/getAllBands`, API.withCreds);
      if (res.status === 401) {
        setError("กรุณาเข้าสู่ระบบก่อน");
        setBands([]);
        return;
      }
      if (!res.ok) throw new Error("โหลดข้อมูลวงไม่สำเร็จ");
      const data = await res.json();
      setBands(Array.isArray(data?.bands) ? data.bands : []);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBands(); }, [loadBands]);

  return (
    <div className="min-h-screen py-10 px-6" style={{ backgroundColor: "#F7F3EB" }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm text-amber-800 mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
            รายชื่อวงดนตรี
          </div>
          <h1 className="text-4xl font-bold text-amber-900 mb-2">วงดนตรี Music Club</h1>
          <p className="text-lg text-amber-700">รวมวงดนตรีทุกแนวในชมรม</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setOpenModal(true)}
              className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
            >
              ➕ เพิ่มวงดนตรี
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : bands.length === 0 ? (
          <div className="text-center text-amber-600 text-lg">ยังไม่มีวงดนตรี</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {bands.map((b, i) => (
              <div
                key={b.id}
                className={`bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-7 flex flex-col transition-all ${i % 2 === 0 ? 'bg-white bg-opacity-40' : 'bg-amber-50 bg-opacity-30'}`}
              >
                <h2 className="text-xl font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <span>🎸</span> {b.name}
                </h2>
                <p className="text-sm text-amber-700 mb-2">ก่อตั้ง: <span className="font-semibold text-amber-800">{b.year ?? "-"}</span></p>
                <p className="text-sm text-amber-800 mb-4 line-clamp-3">{b.description || "ไม่มีคำอธิบาย"}</p>

                <div className="mt-auto flex items-center justify-between text-xs text-amber-700">
                  <span>สร้างเมื่อ {b.created_at ? new Date(b.created_at).toLocaleDateString("th-TH") : "-"}</span>
                  <Link to={`/bands/${b.id}`} className="text-amber-800 hover:underline font-medium flex items-center gap-1">
                    <span>🔎</span> ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* โมดัล */}
      <AddBandModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadBands}
      />
    </div>
  );
}
