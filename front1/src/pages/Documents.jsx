// src/pages/Documents.jsx
import { useCallback, useRef, useState } from "react";
import API from "../api";

const ENDPOINT = `${API.BASE}/api/files/upload`;
const bg = { backgroundColor: "#F7F3EB" };
const acceptMime = ["image/jpeg", "image/png", "application/pdf"];
const maxSize = 5 * 1024 * 1024;

export default function Documents() {
  const [items, setItems] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const toast = (m) => window.alert(m);

  const validateFiles = (files) => {
    const arr = Array.from(files || []);
    for (const f of arr) {
      if (!acceptMime.includes(f.type)) {
        setError("รองรับเฉพาะ JPG/PNG/PDF");
        return null;
      }
      if (f.size > maxSize) {
        setError("ไฟล์ต้องไม่เกิน 5MB");
        return null;
      }
    }
    setError("");
    return arr;
  };

  const sendFile = (file) =>
    new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", ENDPOINT, true);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setProgress(Math.round((e.loaded * 100) / e.total));
      };

      xhr.onload = () => {
        try {
          const ok = xhr.status >= 200 && xhr.status < 300;
          const data = JSON.parse(xhr.responseText || "{}");
          if (!ok)
            return reject(
              new Error(data.message || `Upload failed (${xhr.status})`)
            );
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(fd);
    });

  const handleUpload = async (files) => {
    const arr = validateFiles(files);
    if (!arr?.length) return;

    try {
      setUploading(true);
      for (const f of arr) {
        const j = await sendFile(f);
        setItems((prev) => [
          {
            url: `${API.BASE}${j.path}`,
            name: j.filename,
            type: f.type,
            size: f.size,
          },
          ...prev,
        ]);
      }
      toast("อัปโหลดสำเร็จ");
    } catch (e) {
      setError(e.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onInputChange = async (e) => {
    await handleUpload(e.target.files);
    e.target.value = "";
  };

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    await handleUpload(e.dataTransfer.files);
  }, []);

  return (
    <div className="min-h-screen py-10 px-6" style={bg}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-60 rounded-full text-sm text-amber-800 mb-4 backdrop-blur-sm border border-amber-200">
            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
            เอกสาร (Documents)
          </div>
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            อัปโหลดไฟล์/แนบหลักฐาน
          </h1>
          <p className="text-lg text-amber-700">
            รองรับ JPG, PNG และ PDF ขนาดไม่เกิน 5MB
          </p>
        </div>

        {/* Uploader */}
        <div
          className={`rounded-2xl border-2 border-dashed p-8 bg-white/80 backdrop-blur shadow-xl transition-all ${
            dragOver ? "border-amber-500 bg-amber-50" : "border-amber-200"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="text-center space-y-4">
            <p className="text-amber-800">ลากไฟล์มาวางที่นี่ หรือ</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 shadow-lg"
            >
              เลือกไฟล์
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              multiple
              className="hidden"
              onChange={onInputChange}
            />

            {uploading && (
              <div className="pt-4">
                <div className="text-sm text-amber-800 mb-1">
                  กำลังอัปโหลด... {progress}%
                </div>
                <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-amber-600"
                    style={{ width: `${progress}%`, transition: "width .2s" }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/80 backdrop-blur border border-amber-200 shadow p-4 flex gap-4"
            >
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-amber-100 bg-amber-50 flex items-center justify-center">
                {it.type?.includes("pdf") ? (
                  <span className="text-amber-800 text-sm">PDF</span>
                ) : (
                  <img
                    src={it.url}
                    alt={it.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-amber-900 truncate">
                  {it.name}
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  {it.type} · {(it.size / 1024).toFixed(1)} KB
                </div>
                <div className="mt-2 flex gap-2">
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-amber-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50"
                  >
                    เปิดดู
                  </a>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(it.url);
                      toast("คัดลอกลิงก์แล้ว");
                    }}
                    className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900"
                  >
                    คัดลอกลิงก์
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!items.length && (
          <div className="mt-6 text-center text-amber-700">
            อัปโหลดไฟล์เพื่อแสดงรายการล่าสุดที่นี่
          </div>
        )}
      </div>
    </div>
  );
}
