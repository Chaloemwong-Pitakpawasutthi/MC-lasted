// src/pages/Schedules.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

// ดึง HH:mm จากค่าที่หลากหลาย เช่น "17:00", "17:00:00", "17:00:00.000000", "17:00:00Z"
function pickHHMM(input) {
  if (input == null) return null;
  const s = String(input).trim();
  const m = s.match(/(\d{2}):(\d{2})/); // จับคู่แรกพอ
  return m ? `${m[1]}:${m[2]}` : null;
}

/* ---------- formatter แสดงผลอ่านง่ายแบบไทย ----------
   - ถ้าไม่มี time: แสดง "วันที่" อย่างเดียว (แก้ปัญหาขึ้น 00:00)
   - ถ้ามี time: ประกอบเป็นท้องถิ่น Asia/Bangkok โดยใช้ Date local
------------------------------------------------------- */
function formatDateTime(date, time) {
  if (!date && !time) return "-";
  try {
    const dateStr =
      date instanceof Date
        ? date.toISOString().slice(0, 10)
        : String(date).slice(0, 10);

    // ถ้าไม่มี time → แสดงเฉพาะวันที่
    const hhmm = pickHHMM(time);
    if (!hhmm) {
      const dOnly = new Date(`${dateStr}T00:00:00`);
      if (isNaN(dOnly)) throw new Error("invalid-date");
      return dOnly.toLocaleDateString("th-TH", { dateStyle: "medium" });
    }

    // มีเวลา → แสดงวัน+เวลา
    const d = new Date(`${dateStr}T${hhmm}:00`);
    if (isNaN(d)) throw new Error("invalid-datetime");
    const s = d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
    return s.replace(/(\d{1,2}:\d{2})$/, "$1 น.");
  } catch {
    // fallback
    return [date || "-", pickHHMM(time) || ""].join(" ").trim();
  }
}

// normalize ข้อมูลจาก backend
function normalizeItem(it) {
  const rawTime = it.time ?? it.start_time ?? it.startTime ?? null;
  const hhmm = pickHHMM(rawTime);           // → "HH:mm" หรือ null
  const time = hhmm ? `${hhmm}:00` : null;  // เก็บเป็น HH:mm:ss (หรือ null)

  return {
    id:
      it.id ??
      it.schedule_id ??
      `${it.date || it.start_date}-${time || "NA"}-${it.activity || it.title || it.event_name || "activity"}`,
    activity: it.activity ?? it.title ?? it.event_name ?? "กิจกรรม",
    date: it.date ?? it.start_date ?? it.startDate ?? null,
    time,
    location: it.location ?? it.place ?? null,
    status: (it.status ?? it.state ?? "planned").toLowerCase(),
    band_name: it.band_name ?? it.bandName ?? it.band ?? null,
  };
}

export default function Schedules() {
  const navigate = useNavigate();

  // session + permission
  const [me] = useState(() => {
    const s = localStorage.getItem("mc_user");
    return s ? JSON.parse(s) : null;
  });
  const canWrite = ["ผู้ดูแล", "กรรมการ"].includes(me?.role);

  // states
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // ฟิลเตอร์
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---------- guard 401 ---------- */
  async function guard401(res) {
    if (res.status === 401) {
      setErr("กรุณาเข้าสู่ระบบก่อน");
      setSchedules([]);
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  }

  async function load() {
    try {
      setLoading(true);
      setErr("");
      setMsg("");

      const res = await fetch(`${API.BASE}/api/schedules`, API.withCreds);
      if (await guard401(res)) return;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "โหลดข้อมูลตารางกิจกรรมไม่สำเร็จ");
      }

      const data = await res.json();
      const raw = Array.isArray(data) ? data : Array.isArray(data?.schedules) ? data.schedules : [];
      const norm = raw.map(normalizeItem);

      setSchedules(norm);
      setMsg(data?.message || "");
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return schedules.filter((s) => {
      const matchKw =
        !kw ||
        s.activity?.toLowerCase().includes(kw) ||
        s.location?.toLowerCase().includes(kw) ||
        s.band_name?.toLowerCase().includes(kw);
      const matchStatus = statusFilter === "all" ? true : (s.status || "planned") === statusFilter;
      return matchKw && matchStatus;
    });
  }, [schedules, q, statusFilter]);

  return (
    <div className="min-h-screen py-10 px-6" style={{ backgroundColor: "#F7F3EB" }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm text-amber-800 mb-4 backdrop-blur-sm border border-amber-200">
              <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
              ตารางกิจกรรม (Schedules)
            </div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">ตารางซ้อม/แสดง</h1>
            <p className="text-lg text-amber-700">รวมตารางกิจกรรมของทุกวง</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหา: กิจกรรม / สถานที่ / วงดนตรี"
                className="flex-1 min-w-[260px] rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 placeholder-amber-600 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                title="กรองสถานะ"
              >
                <option value="all">ทั้งหมด</option>
                <option value="planned">วางแผน</option>
                <option value="done">เสร็จสิ้น</option>
                <option value="canceled">ยกเลิก</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={load}
                className="rounded-xl bg-amber-800 px-6 py-3 text-sm font-medium text-white hover:bg-amber-900 transition-colors shadow-lg"
              >
                🔄 รีเฟรช
              </button>
              {canWrite && (
                <button
                  onClick={() => navigate("/schedules/add")}
                  className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-medium text-white hover:opacity-90 shadow-lg"
                >
                  ➕ เพิ่มตาราง
                </button>
              )}
            </div>
          </div>
        </div>

        {/* alerts */}
        {err && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-rose-100 text-rose-700 rounded-xl border border-rose-200">
            ⚠️ {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            ✅ {msg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="py-10 text-center text-amber-700">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-amber-700">ไม่พบข้อมูล</div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white bg-opacity-80 backdrop-blur-sm shadow-xl border border-amber-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-amber-100 bg-opacity-60 text-amber-800">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">กิจกรรม</th>
                    <th className="px-6 py-4">วงดนตรี</th>
                    <th className="px-6 py-4">วันเวลา</th>
                    <th className="px-6 py-4">สถานที่</th>
                    <th className="px-6 py-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className={`text-amber-900 ${i % 2 === 0 ? "bg-white/50" : "bg-amber-50/40"}`}
                    >
                      <td className="px-6 py-3">{s.activity}</td>
                      <td className="px-6 py-3">{s.band_name || "-"}</td>
                      <td className="px-6 py-3">{formatDateTime(s.date, s.time)}</td>
                      <td className="px-6 py-3">{s.location || "-"}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                            (s.status || "planned") === "done"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : (s.status || "planned") === "canceled"
                              ? "bg-rose-100 text-rose-700 border-rose-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {s.status || "planned"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
