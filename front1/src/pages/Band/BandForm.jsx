// src/pages/BandForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";

export default function BandForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const me = (() => {
    try {
      const s = localStorage.getItem("mc_user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();
  const canUse = ["ผู้ดูแล", "กรรมการ"].includes(me?.role);

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canUse) {
      navigate("/bands", { replace: true });
      return;
    }
    if (mode === "edit") {
      (async () => {
        try {
          setLoading(true);
          setErr("");
          const res = await fetch(`${API.BASE}/api/bands/getBand/${id}`, API.withCreds);
          if (res.status === 401) {
            navigate("/login", { replace: true });
            return;
          }
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.message || "โหลดข้อมูลวงไม่สำเร็จ");
          }
          const data = await res.json();
          setName(data?.band?.name || "");
          setYear(data?.band?.year || "");
          setDesc(data?.band?.description || "");
        } catch (e) {
          setErr(e.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, id, canUse, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name || !year) return alert("กรุณากรอกชื่อวงและปีที่จัดตั้ง");
    try {
      setSubmitting(true);
      let res;
      if (mode === "create") {
        res = await fetch(`${API.BASE}/api/bands`, {
          method: "POST",
          ...API.withCreds,
          body: JSON.stringify({ name, year: Number(year), description: desc }),
        });
      } else {
        res = await fetch(`${API.BASE}/api/bands/updateBand/${id}`, {
          method: "PUT",
          ...API.withCreds,
          body: JSON.stringify({ name, year: Number(year), description: desc }),
        });
      }
      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "บันทึกไม่สำเร็จ");
      }
      navigate("/bands", { replace: true });
    } catch (e) {
      alert(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  if (!canUse) return null;
  if (loading) return <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>;
  if (err) return <div className="p-6 text-center text-rose-600">{err}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "เพิ่มวงดนตรี" : "แก้ไขวงดนตรี"}
            </h1>
            <p className="text-sm text-gray-600">
              กรอกข้อมูลแล้วกดบันทึก
            </p>
          </div>
          <button
            onClick={() => navigate("/bands")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ← กลับ
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อวง</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น Jazz Club"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่ก่อตั้ง</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea
              rows="4"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เล่าเกี่ยวกับแนวเพลง สมาชิก หรือกิจกรรมของวง"
            />
          </div>

          <button
            disabled={submitting}
            className={
              "rounded-xl px-5 py-2 text-sm font-semibold text-white transition " +
              (submitting
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90")
            }
          >
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </form>
      </div>
    </div>
  );
}
