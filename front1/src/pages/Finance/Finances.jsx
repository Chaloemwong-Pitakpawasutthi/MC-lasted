// src/pages/finances/Finances.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

/* ---------- helpers ---------- */
const fmtMoney = (n) =>
  Number(n || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const badge = (type) =>
  type === "รายรับ"
    ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"
    : "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200";

const today = () => new Date().toISOString().slice(0, 10);

/* ---------- page ---------- */
export default function Finances() {
  const navigate = useNavigate();

  const [me] = useState(() => {
    const s = localStorage.getItem("mc_user");
    return s ? JSON.parse(s) : null;
  });
  const canWrite = ["ผู้ดูแล", "กรรมการ"].includes(me?.role);

  const [tab, setTab] = useState("list"); // list | summary
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [finances, setFinances] = useState([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    type: "รายรับ",
    category: "",
    amount: "",
    date: today(),
    description: "",
    attachment: "",
  });

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [summary, setSummary] = useState([]);

  const ENDPOINT = `${API.BASE}/api/finances`;

  /* ---------- บังคับล็อกอิน ---------- */
  async function guard401(res) {
    if (res.status === 401) {
      setErr("กรุณาเข้าสู่ระบบก่อน");
      setFinances([]);
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  }

  /* ---------- loaders ---------- */
  async function loadList() {
    try {
      setLoading(true);
      setErr("");
      setMsg("");
      const res = await fetch(`${ENDPOINT}/`, API.withCreds);
      if (await guard401(res)) return;
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || "โหลดข้อมูลล้มเหลว"
        );
      const data = await res.json();
      setFinances(Array.isArray(data?.finances) ? data.finances : []);
      setMsg(data?.message || "");
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      setLoading(true);
      setErr("");
      setMsg("");
      const res = await fetch(
        `${ENDPOINT}/summary/monthly/${year}`,
        API.withCreds
      );
      if (await guard401(res)) return;
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || "โหลดสรุปล้มเหลว"
        );
      const data = await res.json();
      setSummary(Array.isArray(data?.summary) ? data.summary : []);
      setMsg(data?.message || "");
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "list") loadList();
  }, [tab]);

  useEffect(() => {
    if (tab === "summary") loadSummary();
  }, [tab, year]);

  /* ---------- filters ---------- */
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return finances.filter((r) => {
      const passQ =
        !kw ||
        r.category?.toLowerCase().includes(kw) ||
        r.description?.toLowerCase().includes(kw);
      const passType = typeFilter === "all" || r.type === typeFilter;
      const passFrom = !dateFrom || r.date >= dateFrom;
      const passTo = !dateTo || r.date <= dateTo;
      return passQ && passType && passFrom && passTo;
    });
  }, [finances, q, typeFilter, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const income = filtered
      .filter((x) => x.type === "รายรับ")
      .reduce((s, x) => s + Number(x.amount), 0);
    const expense = filtered
      .filter((x) => x.type === "รายจ่าย")
      .reduce((s, x) => s + Number(x.amount), 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  /* ---------- CRUD ---------- */
  function openAdd() {
    setEditingId(null);
    setForm({
      type: "รายรับ",
      category: "",
      amount: "",
      date: today(),
      description: "",
      attachment: "",
    });
    setShowForm(true);
  }

  async function openEdit(id) {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${ENDPOINT}/${id}`, API.withCreds);
      if (await guard401(res)) return;
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || "ดึงข้อมูลไม่สำเร็จ"
        );
      const data = await res.json();
      const f = data.finance;
      setForm({
        type: f.type === "รายจ่าย" ? "รายจ่าย" : "รายรับ",
        category: (f.category || "").trim(),
        amount: String(Number(f.amount ?? 0).toFixed(2)),
        date: (f.date || "").slice(0, 10),
        description: f.description || "",
        attachment: f.attachment || "",
      });
      setEditingId(id);
      setShowForm(true);
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!canWrite) return;

    const amountNum = Number(form.amount);
    if (Number.isNaN(amountNum)) return setErr("จำนวนเงินต้องเป็นตัวเลข");
    if (amountNum < 0) return setErr("จำนวนเงินต้องไม่ติดลบ");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date || ""))
      return setErr("รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)");
    if (!form.category.trim()) return setErr("กรุณากรอกหมวดหมู่");

    const payload = {
      type: form.type === "รายจ่าย" ? "รายจ่าย" : "รายรับ",
      category: form.category.trim(),
      amount: Number(amountNum.toFixed(2)),
      date: form.date,
      description: form.description?.trim() || null,
      attachment: form.attachment?.trim() || null,
    };

    try {
      setLoading(true);
      setErr("");
      setMsg("");
      const res = await fetch(
        editingId ? `${ENDPOINT}/${editingId}` : `${ENDPOINT}/add`,
        {
          method: editingId ? "PUT" : "POST",
          ...API.withCreds,
          body: JSON.stringify(payload),
        }
      );
      if (await guard401(res)) return;
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || "บันทึกไม่สำเร็จ"
        );
      setShowForm(false);
      await loadList();
      setMsg(editingId ? "อัปเดตรายการสำเร็จ" : "เพิ่มรายการสำเร็จ");
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function askDelete(id) {
    if (!canWrite) return;
    if (!confirm("ยืนยันลบรายการนี้?")) return;
    try {
      setLoading(true);
      setErr("");
      setMsg("");
      const res = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        ...API.withCreds,
      });
      if (await guard401(res)) return;
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({}))).message || "ลบไม่สำเร็จ"
        );
      await loadList();
      setMsg("ลบรายการสำเร็จ");
    } catch (e) {
      setErr(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen py-10 px-6" style={{ backgroundColor: "#F7F3EB" }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm text-amber-800 mb-4 backdrop-blur-sm">
              <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
              การเงิน (Finances)
            </div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">
              บันทึกรายรับ-รายจ่าย
            </h1>
            <p className="text-lg text-amber-700">จัดการและดูสรุปรายเดือนของชมรม</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200">
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหา (หมวด/คำอธิบาย)"
                className="flex-1 min-w-[220px] rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 placeholder-amber-600 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">ประเภททั้งหมด</option>
                <option value="รายรับ">รายรับ</option>
                <option value="รายจ่าย">รายจ่าย</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 outline-none"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => (tab === "list" ? loadList() : loadSummary())}
                className="rounded-xl bg-amber-800 px-6 py-3 text-sm font-medium text-white hover:bg-amber-900 transition-colors shadow-lg"
              >
                🔄 รีเฟรช
              </button>
              {canWrite && tab === "list" && (
                <button
                  onClick={openAdd}
                  className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg"
                >
                  ➕ เพิ่มรายการ
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

        {/* tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("list")}
            className={`rounded-lg px-4 py-2 text-sm font-medium border ${
              tab === "list"
                ? "bg-amber-900 text-white border-amber-900"
                : "bg-white text-amber-800 border-amber-200"
            }`}
          >
            รายการ
          </button>
          <button
            onClick={() => setTab("summary")}
            className={`rounded-lg px-4 py-2 text-sm font-medium border ${
              tab === "summary"
                ? "bg-amber-900 text-white border-amber-900"
                : "bg-white text-amber-800 border-amber-200"
            }`}
          >
            สรุปรายเดือน
          </button>
        </div>

        {/* ========== LIST ========== */}
        {tab === "list" && (
          <>
            {/* totals */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-amber-200 bg-white bg-opacity-80 p-4">
                <p className="text-sm text-amber-700">รายรับ (หลังฟิลเตอร์)</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">
                  {fmtMoney(totals.income)} ฿
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-white bg-opacity-80 p-4">
                <p className="text-sm text-amber-700">รายจ่าย (หลังฟิลเตอร์)</p>
                <p className="mt-1 text-2xl font-semibold text-rose-700">
                  {fmtMoney(totals.expense)} ฿
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-white bg-opacity-80 p-4">
                <p className="text-sm text-amber-700">คงเหลือ (หลังฟิลเตอร์)</p>
                <p
                  className={`mt-1 text-2xl font-semibold ${
                    totals.balance >= 0 ? "text-emerald-800" : "text-rose-700"
                  }`}
                >
                  {fmtMoney(totals.balance)} ฿
                </p>
              </div>
            </div>

            {/* table */}
            <div className="overflow-hidden rounded-2xl bg-white bg-opacity-80 backdrop-blur-sm shadow-xl border border-amber-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-amber-100 bg-opacity-60 text-amber-800">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">วันที่</th>
                      <th className="px-6 py-4">ประเภท</th>
                      <th className="px-6 py-4">หมวดหมู่</th>
                      <th className="px-6 py-4 text-right">จำนวนเงิน</th>
                      <th className="px-6 py-4">คำอธิบาย</th>
                      <th className="px-6 py-4">ไฟล์แนบ</th>
                      {canWrite && <th className="px-6 py-4 text-right">จัดการ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={canWrite ? 7 : 6}
                          className="px-6 py-10 text-center text-amber-700"
                        >
                          กำลังโหลด...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={canWrite ? 7 : 6}
                          className="px-6 py-10 text-center text-amber-700"
                        >
                          ไม่พบรายการ
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`text-amber-900 ${
                            i % 2 === 0 ? "bg-white/50" : "bg-amber-50/40"
                          }`}
                        >
                          <td className="px-6 py-3 whitespace-nowrap">
                            {r.date?.slice(0, 10)}
                          </td>
                          <td className="px-6 py-3">
                            <span className={badge(r.type)}>{r.type}</span>
                          </td>
                          <td className="px-6 py-3">{r.category}</td>
                          <td className="px-6 py-3 text-right font-medium">
                            {fmtMoney(r.amount)} ฿
                          </td>
                          <td className="px-6 py-3 max-w-[280px]">
                            <span title={r.description || ""} className="line-clamp-2">
                              {r.description || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            {r.attachment ? (
                              <a
                                href={r.attachment}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-700 underline"
                              >
                                เปิดไฟล์
                              </a>
                            ) : (
                              <span className="text-amber-500">-</span>
                            )}
                          </td>
                          {canWrite && (
                            <td className="px-6 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEdit(r.id)}
                                  className="rounded-lg border border-amber-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50"
                                >
                                  ✏️ แก้ไข
                                </button>
                                <button
                                  onClick={() => askDelete(r.id)}
                                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                                >
                                  🗑️ ลบ
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ========== SUMMARY ========== */}
        {tab === "summary" && (
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-sm text-amber-700">
                  เลือกปี
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-40 rounded-xl border border-amber-200 bg-white bg-opacity-80 px-4 py-3 text-sm text-amber-900 outline-none"
                />
              </div>
              <button
                onClick={loadSummary}
                className="rounded-xl bg-amber-800 px-6 py-3 text-sm font-medium text-white hover:bg-amber-900 transition-colors shadow-lg"
              >
                📊 ดึงสรุป
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white bg-opacity-80 backdrop-blur-sm shadow-xl border border-amber-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-amber-100 bg-opacity-60 text-amber-800">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">เดือน (YYYY-MM)</th>
                      <th className="px-6 py-4 text-right">รายรับ</th>
                      <th className="px-6 py-4 text-right">รายจ่าย</th>
                      <th className="px-6 py-4 text-right">คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-amber-700">
                          กำลังโหลด...
                        </td>
                      </tr>
                    ) : summary.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-amber-700">
                          ไม่พบข้อมูลสรุป
                        </td>
                      </tr>
                    ) : (
                      summary.map((m) => (
                        <tr key={m.month} className="text-amber-900">
                          <td className="px-6 py-3">{m.month}</td>
                          <td className="px-6 py-3 text-right text-emerald-700 font-medium">
                            {fmtMoney(m.income)} ฿
                          </td>
                          <td className="px-6 py-3 text-right text-rose-700 font-medium">
                            {fmtMoney(m.expense)} ฿
                          </td>
                          <td
                            className={`px-6 py-3 text-right font-semibold ${
                              Number(m.balance) >= 0 ? "text-emerald-800" : "text-rose-700"
                            }`}
                          >
                            {fmtMoney(m.balance)} ฿
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="text-lg font-semibold">
                {editingId ? "แก้ไขรายการ" : "เพิ่มรายการ"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                ✖
              </button>
            </div>
            <form onSubmit={submitForm} className="px-5 py-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">ประเภท</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-xl border border-amber-200 px-3 py-2"
                    required
                  >
                    <option>รายรับ</option>
                    <option>รายจ่าย</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">หมวดหมู่</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-amber-200 px-3 py-2"
                    placeholder="เช่น ค่าเช่าสถานที่, สนับสนุน"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">จำนวนเงิน (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full rounded-xl border border-amber-200 px-3 py-2"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">วันที่</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl border border-amber-200 px-3 py-2"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-600">คำอธิบาย</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-amber-200 px-3 py-2"
                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-gray-600">ไฟล์แนบ (URL)</label>
                  <input
                    value={form.attachment}
                    onChange={(e) => setForm((f) => ({ ...f, attachment: e.target.value }))}
                    className="w-full rounded-xl border border-amber-200 px-3 py-2"
                    placeholder="https://…"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading || !canWrite}
                  className="rounded-lg bg-amber-800 px-4 py-2 text-white hover:bg-amber-900"
                >
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
